import { describe, expect, it } from "vitest";
import {
  calculateBasePoints,
  calculateComponentPoints,
  calculateGrandTotalPoints,
  calculateGrandTotalPossiblePoints,
  calculatePointsByLayer,
  calculatePossiblePointsByLayer,
} from "./centralizedCalculations";
import { createSubComponents } from "./fc-service-functions";
import { ClassName, ComponentType, TGenericComponent } from "./types";

const component = (
  className: ClassName,
  overrides: Partial<TGenericComponent> = {},
): TGenericComponent => ({
  id: 1,
  title: "Component",
  description: null,
  className,
  componentType: null,
  dataElements: 0,
  readingReferences: 0,
  writingReferences: 0,
  functionalMultiplier: 1,
  operations: 0,
  degreeOfCompletion: 1,
  previousFCId: null,
  orderPosition: 0,
  isMLA: false,
  parentFCId: null,
  ...overrides,
});

const sumOfLayers = (layers: {
  userInterface: number;
  business: number;
  database: number;
}) => layers.userInterface + layers.business + layers.database;

// The expected values are worked out by hand from the FiSMA 1.1 formulas, not copied from the
// code's output, so a wrong constant (a "/7" that should be "/5") fails here instead of silently
// changing every customer's report.
describe("base points per FiSMA 1.1 component class", () => {
  const cases: [string, TGenericComponent, number][] = [
    [
      "navigation and query: 0.2 + 7/7 + 2/2",
      component("Interactive end-user navigation and query service", {
        componentType: "browsing lists",
        dataElements: 7,
        readingReferences: 2,
      }),
      2.2,
    ],
    [
      "input, 2-functional: 2 * (0.2 + 5/5 + 3/1.5 + 2/2)",
      component("Interactive end-user input service", {
        componentType: "2-functional" as ComponentType,
        dataElements: 5,
        writingReferences: 3,
        readingReferences: 2,
      }),
      8.4,
    ],
    [
      "output: 1 + 10/5 + 4/2",
      component("Non-interactive end-user output service", {
        dataElements: 10,
        readingReferences: 4,
      }),
      5,
    ],
    [
      "interface to other applications: 0.5 + 14/7 + 2/2",
      component("Interface service to other applications", {
        dataElements: 14,
        readingReferences: 2,
      }),
      3.5,
    ],
    [
      "interface from other applications: 0.2 + 5/5 + 3/1.5 + 2/2",
      component("Interface service from other applications", {
        dataElements: 5,
        writingReferences: 3,
        readingReferences: 2,
      }),
      4.2,
    ],
    [
      "data storage: 1.5 + 8/4",
      component("Data storage service", { dataElements: 8 }),
      3.5,
    ],
    [
      "algorithmic: 0.1 + 10/5 + 6/3",
      component("Algorithmic or manipulation service", {
        dataElements: 10,
        operations: 6,
      }),
      4.1,
    ],
  ];

  it.each(cases)("%s", (_formula, c, expected) => {
    expect(calculateBasePoints(c)).toBeCloseTo(expected, 10);
  });

  it("scales by degree of completion, and a component with none counts for nothing", () => {
    const storage = component("Data storage service", { dataElements: 8 });
    expect(
      calculateComponentPoints({ ...storage, degreeOfCompletion: 0.5 }),
    ).toBeCloseTo(1.75, 10);
    expect(
      calculateComponentPoints({ ...storage, degreeOfCompletion: 0 }),
    ).toBe(0);
  });
});

// The summary box and both PDF reports show the same project total split into layers. They have
// disagreed before (#775), so check the split against the total instead of against more constants.
describe("layer split of a project", () => {
  const withSubComponents = (parent: TGenericComponent): TGenericComponent => ({
    ...parent,
    isMLA: true,
    subComponents: createSubComponents(parent),
  });

  const components: TGenericComponent[] = [
    withSubComponents(
      component("Interactive end-user navigation and query service", {
        id: 1,
        componentType: "browsing lists",
        dataElements: 7,
        readingReferences: 2,
        degreeOfCompletion: 0.7,
      }),
    ),
    withSubComponents(
      component("Data storage service", {
        id: 2,
        dataElements: 8,
        degreeOfCompletion: 0.3,
      }),
    ),
    component("Non-interactive end-user output service", {
      id: 3,
      dataElements: 10,
      readingReferences: 4,
      degreeOfCompletion: 0.5,
    }),
    // Parts of a half-filled project must not be dropped from the layer totals.
    component("Algorithmic or manipulation service", {
      id: 4,
      dataElements: 10,
      operations: 6,
    }),
  ];

  it("adds up to the grand total, sub-components included", () => {
    expect(sumOfLayers(calculatePointsByLayer(components))).toBeCloseTo(
      calculateGrandTotalPoints(components),
      10,
    );
  });

  it("adds up to the grand total of possible points too", () => {
    expect(sumOfLayers(calculatePossiblePointsByLayer(components))).toBeCloseTo(
      calculateGrandTotalPossiblePoints(components),
      10,
    );
  });

  it("counts sub-components in the total, not only their parents", () => {
    const parentsOnly = components.map((c) => ({ ...c, subComponents: [] }));
    expect(calculateGrandTotalPoints(components)).toBeGreaterThan(
      calculateGrandTotalPoints(parentsOnly),
    );
  });
});
