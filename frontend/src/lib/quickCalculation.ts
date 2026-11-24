import { calculateBasePoints } from "./centralizedCalculations.ts";
import {
  createSubComponents,
  isMultiLayerArchitectureComponent,
  resetFunctionalComponentParameters,
} from "./fc-service-functions.ts";
import {
  ClassName,
  ComponentType,
  MLAsubComponent,
  TGenericComponent,
} from "./types.ts";

export const quickCalculationArchitectures = [
  "threeLayer",
  "singlePlatform",
  "isolatedUi",
  "isolatedDatabase",
] as const;

export type QuickCalculationArchitecture =
  (typeof quickCalculationArchitectures)[number];

export type QuickCalculationKey =
  | "query"
  | "input"
  | "output"
  | "interfaceTo"
  | "interfaceFrom"
  | "entity"
  | "rule";

// What an average item of one class looks like. Parameters the class does not use are ignored.
export type QuickCalculationAverage = {
  componentType: ComponentType;
  dataElements: number;
  readingReferences: number;
  writingReferences: number;
  operations: number;
};

export type QuickCalculationCounts = Record<QuickCalculationKey, number>;
export type QuickCalculationAverages = Record<
  QuickCalculationKey,
  QuickCalculationAverage
>;

export const quickCalculationItems: {
  key: QuickCalculationKey;
  className: ClassName;
}[] = [
  {
    key: "query",
    className: "Interactive end-user navigation and query service",
  },
  { key: "input", className: "Interactive end-user input service" },
  { key: "output", className: "Non-interactive end-user output service" },
  { key: "interfaceTo", className: "Interface service to other applications" },
  {
    key: "interfaceFrom",
    className: "Interface service from other applications",
  },
  { key: "entity", className: "Data storage service" },
  { key: "rule", className: "Algorithmic or manipulation service" },
];

// The average items of the original FiSMA quick calculator (Pikalaskuri).
// The original script has the reading and writing references of the input and "interface from"
// services the other way around: the reference counted with divisor 1.5 is a writing reference in
// the FiSMA 1.1 formulas (calculations.ts), and the one with divisor 2 is a reading reference.
export const defaultQuickCalculationAverages: QuickCalculationAverages = {
  query: {
    componentType: "data inquiries",
    dataElements: 12,
    readingReferences: 2,
    writingReferences: 0,
    operations: 0,
  },
  input: {
    componentType: "2-functional",
    dataElements: 12,
    readingReferences: 1,
    writingReferences: 2,
    operations: 0,
  },
  output: {
    componentType: "forms",
    dataElements: 20,
    readingReferences: 3,
    writingReferences: 0,
    operations: 0,
  },
  interfaceTo: {
    componentType: "messages to other applications",
    dataElements: 15,
    readingReferences: 2,
    writingReferences: 0,
    operations: 0,
  },
  interfaceFrom: {
    componentType: "messages from other applications",
    dataElements: 15,
    readingReferences: 1,
    writingReferences: 2,
    operations: 0,
  },
  entity: {
    componentType: "entities or classes",
    dataElements: 12,
    readingReferences: 0,
    writingReferences: 0,
    operations: 0,
  },
  rule: {
    componentType: "calculation routines",
    dataElements: 10,
    readingReferences: 0,
    writingReferences: 0,
    operations: 9,
  },
};

// Project generation is refused above this many components (sub-components included).
export const MAX_GENERATED_COMPONENTS = 1000;

const applyAverageMessage = (
  subComponent: MLAsubComponent,
  averages: QuickCalculationAverages,
): MLAsubComponent => {
  const isSending =
    subComponent.className === "Interface service to other applications";
  const message = isSending ? averages.interfaceTo : averages.interfaceFrom;
  return {
    ...subComponent,
    dataElements: message.dataElements,
    readingReferences: message.readingReferences,
    writingReferences: isSending ? null : message.writingReferences,
  };
};

const buildAverageComponent = (
  { key, className }: (typeof quickCalculationItems)[number],
  averages: QuickCalculationAverages,
  title: string,
  orderPosition: number,
  degreeOfCompletion: number,
): TGenericComponent => {
  const average = averages[key];
  return resetFunctionalComponentParameters({
    id: 0,
    title,
    description: null,
    className,
    componentType: average.componentType,
    dataElements: average.dataElements,
    readingReferences: average.readingReferences,
    writingReferences: average.writingReferences,
    functionalMultiplier: null,
    operations: average.operations,
    degreeOfCompletion,
    previousFCId: null,
    orderPosition,
    isMLA: false,
    parentFCId: null,
  });
};

// Projects always include the three-layer messages for eligible components.
const buildProjectComponent = (
  item: (typeof quickCalculationItems)[number],
  averages: QuickCalculationAverages,
  title: string,
  orderPosition: number,
  degreeOfCompletion: number,
): TGenericComponent => {
  const component = buildAverageComponent(
    item,
    averages,
    title,
    orderPosition,
    degreeOfCompletion,
  );
  if (!isMultiLayerArchitectureComponent(component)) return component;
  return {
    ...component,
    isMLA: true,
    subComponents: createSubComponents(component).map((subComponent) =>
      applyAverageMessage(subComponent, averages),
    ),
  };
};

export const calculateQuickCalculationSize = (
  counts: QuickCalculationCounts,
  averages: QuickCalculationAverages,
  architecture: QuickCalculationArchitecture,
): number => {
  const itemPoints = Object.fromEntries(
    quickCalculationItems.map((item) => [
      item.key,
      calculateBasePoints(buildAverageComponent(item, averages, "", 0, 1)),
    ]),
  ) as Record<QuickCalculationKey, number>;
  const baseSize = quickCalculationItems.reduce(
    (sum, { key }) => sum + counts[key] * itemPoints[key],
    0,
  );

  // Each split contributes two sending and two receiving messages per affected item.
  const uiItems = counts.query + counts.input;
  const messagePairSize = itemPoints.interfaceTo + itemPoints.interfaceFrom;
  switch (architecture) {
    case "singlePlatform":
      return baseSize;
    case "isolatedUi":
      return (
        baseSize +
        (2 * uiItems * itemPoints.interfaceTo +
          2 * uiItems * itemPoints.interfaceFrom)
      );
    case "isolatedDatabase":
      return baseSize + 2 * counts.entity * messagePairSize;
    case "threeLayer":
      return baseSize + 2 * (uiItems + counts.entity) * messagePairSize;
  }
};

export const countGeneratedComponents = (
  counts: QuickCalculationCounts,
  averages: QuickCalculationAverages,
): number =>
  quickCalculationItems.reduce(
    (sum, item) =>
      sum +
      counts[item.key] *
        (1 +
          (buildProjectComponent(item, averages, "", 0, 1).subComponents
            ?.length ?? 0)),
    0,
  );

// The parent components of the project the quick calculation describes. Their titles are
// "<titles[key]> <running number>", and their MLA sub-components are attached to them.
export const buildQuickCalculationComponents = (
  counts: QuickCalculationCounts,
  averages: QuickCalculationAverages,
  titles: Record<QuickCalculationKey, string>,
  degreeOfCompletion: number,
): TGenericComponent[] => {
  const components: TGenericComponent[] = [];
  for (const item of quickCalculationItems) {
    for (let number = 1; number <= counts[item.key]; number++) {
      components.push(
        buildProjectComponent(
          item,
          averages,
          `${titles[item.key]} ${number}`,
          components.length,
          degreeOfCompletion,
        ),
      );
    }
  }
  return components;
};
