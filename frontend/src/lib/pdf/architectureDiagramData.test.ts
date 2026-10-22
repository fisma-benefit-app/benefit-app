import { describe, expect, it } from "vitest";
import { calculateGrandTotalPoints } from "../centralizedCalculations";
import type { MLAsubComponent, TGenericComponent } from "../types";
import {
  calculateDiagramFigures,
  createArchitectureDiagramData,
} from "./architectureDiagramData";
import type { DiagramLabels } from "./architectureDiagramData";

const component = (
  className: TGenericComponent["className"],
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

const message = (
  subComponentType: MLAsubComponent["subComponentType"],
): MLAsubComponent => ({
  ...component("Interactive end-user navigation and query service", {
    parentFCId: 1,
  }),
  subComponentType,
  isReadonly: true,
  subComponents: undefined as never,
});

const labels: DiagramLabels = {
  uiLayer: "UI",
  businessLayer: "Business",
  databaseLayer: "Database",
  externalLayer: "External",
  algorithmicActivities: "Algorithmic",
  interfaces: "interfaces",
  functions: "functions",
  concepts: "concepts",
  in: "in",
  out: "out",
  pointUnit: "FP",
};

// Expected points are worked out by hand from the FiSMA 1.1 formulas:
//   interface to other applications:   0.5 + 14/7 + 2/2 = 3.5
//   interface from other applications: 0.2 + 5/5 + 3/1.5 + 2/2 = 4.2
//   data storage:                      1.5 + 8/4 = 3.5
const toOther = component("Interface service to other applications", {
  id: 1,
  dataElements: 14,
  readingReferences: 2,
});
const fromOther = component("Interface service from other applications", {
  id: 2,
  dataElements: 5,
  writingReferences: 3,
  readingReferences: 2,
});
const storage = component("Data storage service", { id: 3, dataElements: 8 });
const navigation = component(
  "Interactive end-user navigation and query service",
  {
    id: 4,
    componentType: "browsing lists",
    dataElements: 7,
    readingReferences: 2,
    isMLA: true,
    subComponents: [
      message("UI-B"),
      message("UI-B"),
      message("B-UI"),
      message("B-D"),
    ],
  },
);

const current = [toOther, fromOther, storage, navigation];

describe("architecture diagram figures", () => {
  it("counts the interfaces and messages by direction", () => {
    const figures = calculateDiagramFigures(current);
    expect(figures.toOtherApplications).toBe(1);
    expect(figures.fromOtherApplications).toBe(1);
    expect(figures.externalCount).toBe(2);
    expect(figures.externalPoints).toBeCloseTo(3.5 + 4.2, 10);
    expect(figures.uiToBusiness).toBe(2);
    expect(figures.businessToUi).toBe(1);
    expect(figures.businessToDatabase).toBe(1);
    expect(figures.databaseToBusiness).toBe(0);
  });

  // The diagram draws the interfaces as their own part, so they must not also stay in the
  // business layer's figure, or the picture would add up to more than the project's total.
  it("splits the project total across the four boxes without counting anything twice", () => {
    const figures = calculateDiagramFigures(current);
    const shown =
      figures.uiPoints +
      figures.businessPoints +
      figures.databasePoints +
      figures.externalPoints;
    expect(shown).toBeCloseTo(calculateGrandTotalPoints(current), 10);
  });
});

describe("architecture diagram deltas", () => {
  const withoutFromOther = [toOther, storage, navigation];

  it("shows what grew, and leaves out what did not change", () => {
    const data = createArchitectureDiagramData(
      calculateDiagramFigures(current),
      calculateDiagramFigures(withoutFromOther),
      labels,
    );
    // The only difference is the added 4.2 point "from other applications" interface.
    expect(data.external.delta).toBe("(+4.20)");
    expect(data.external.detailDelta).toBe("(+1)");
    expect(data.businessExternal.in.delta).toBe("(+1)");
    expect(data.businessExternal.out.delta).toBeUndefined();
    expect(data.database.delta).toBeUndefined();
    expect(data.database.detailDelta).toBeUndefined();
    expect(data.uiBusiness.in.delta).toBeUndefined();
  });

  it("shows what shrank with a minus sign", () => {
    const data = createArchitectureDiagramData(
      calculateDiagramFigures(withoutFromOther),
      calculateDiagramFigures(current),
      labels,
    );
    expect(data.external.delta).toBe("(-4.20)");
    expect(data.businessExternal.in.delta).toBe("(-1)");
  });

  it("shows no deltas at all without a previous version", () => {
    const data = createArchitectureDiagramData(
      calculateDiagramFigures(current),
      undefined,
      labels,
    );
    expect(data.external.delta).toBeUndefined();
    expect(data.businessExternal.in.delta).toBeUndefined();
    expect(data.ui.detailDelta).toBeUndefined();
  });
});
