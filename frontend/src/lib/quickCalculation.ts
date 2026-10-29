import { calculateGrandTotalPossiblePoints } from "./centralizedCalculations.ts";
import {
  createSubComponents,
  isMultiLayerArchitectureComponent,
  resetFunctionalComponentParameters,
} from "./fc-service-functions.ts";
import { ClassName, ComponentType, TGenericComponent } from "./types.ts";

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

// One average item of a class as a real component, with its multi-layer sub-components when the
// class has any (the quick calculation always assumes a three-layer architecture).
const buildAverageComponent = (
  { key, className }: (typeof quickCalculationItems)[number],
  averages: QuickCalculationAverages,
  title: string,
  orderPosition: number,
  degreeOfCompletion: number,
): TGenericComponent => {
  const average = averages[key];
  const component = resetFunctionalComponentParameters({
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

  if (!isMultiLayerArchitectureComponent(component)) return component;
  return {
    ...component,
    isMLA: true,
    subComponents: createSubComponents(component),
  };
};

export const calculateQuickCalculationSize = (
  counts: QuickCalculationCounts,
  averages: QuickCalculationAverages,
): number =>
  quickCalculationItems.reduce(
    (sum, item) =>
      sum +
      counts[item.key] *
        calculateGrandTotalPossiblePoints([
          buildAverageComponent(item, averages, "", 0, 1),
        ]),
    0,
  );

export const countGeneratedComponents = (
  counts: QuickCalculationCounts,
  averages: QuickCalculationAverages,
): number =>
  quickCalculationItems.reduce(
    (sum, item) =>
      sum +
      counts[item.key] *
        (1 +
          (buildAverageComponent(item, averages, "", 0, 1).subComponents
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
        buildAverageComponent(
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
