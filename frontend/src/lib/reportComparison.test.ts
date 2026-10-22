import { describe, expect, it } from "vitest";
import { calculateBasePoints } from "./centralizedCalculations";
import {
  buildPreviousComponentsMap,
  componentPointsText,
  findPreviousSubComponent,
  isChanged,
} from "./reportComparison";
import { MLAsubComponent, Project, TGenericComponent } from "./types";

const component = (
  overrides: Partial<TGenericComponent> = {},
): TGenericComponent => ({
  id: 1,
  title: "Component",
  description: null,
  className: "Interactive end-user navigation and query service",
  componentType: null,
  dataElements: 5,
  readingReferences: 2,
  writingReferences: 1,
  functionalMultiplier: 1,
  operations: 3,
  degreeOfCompletion: 1,
  previousFCId: null,
  orderPosition: 0,
  isMLA: false,
  parentFCId: null,
  ...overrides,
});

const subComponent = (
  overrides: Partial<MLAsubComponent> = {},
): MLAsubComponent => ({
  ...component({ parentFCId: 1 }),
  subComponentType: "UI-B",
  isReadonly: true,
  subComponents: undefined as never,
  ...overrides,
});

const project = (functionalComponents: TGenericComponent[]): Project => ({
  id: 1,
  projectName: "Project",
  version: 1,
  reportContactDetails: null,
  reportNotes: null,
  createdAt: "2026-01-01",
  versionCreatedAt: "2026-01-01",
  updatedAt: "2026-01-01",
  active: true,
  functionalComponents,
  projectAppUsers: [],
});

describe("isChanged", () => {
  it("never highlights anything in version 1", () => {
    expect(isChanged(5, null, true)).toBe(false);
  });

  it("highlights a value that differs from the previous version", () => {
    expect(isChanged(5, 4, false)).toBe(true);
  });

  it("does not highlight an unchanged value, including 0", () => {
    expect(isChanged(0, 0, false)).toBe(false);
    expect(isChanged("0.00", "0.00", false)).toBe(false);
  });
});

describe("componentPointsText", () => {
  it("is 0.00 for a missing component", () => {
    expect(componentPointsText(null)).toBe("0.00");
  });

  it("multiplies the base points by the degree of completion", () => {
    const full = component({ degreeOfCompletion: 1 });
    const half = component({ degreeOfCompletion: 0.5 });
    expect(calculateBasePoints(full)).toBeGreaterThan(0);
    expect(Number(componentPointsText(half))).toBeCloseTo(
      calculateBasePoints(full) * 0.5,
    );
  });

  // Regression: a previous degree of completion of 0 used to be treated as "no multiplier",
  // so an unchanged 0.00 was compared against the full base points and highlighted.
  it("gives 0.00 for a degree of completion of 0, so an unchanged component is not highlighted", () => {
    const current = component({ degreeOfCompletion: 0 });
    const previous = component({ id: 2, degreeOfCompletion: 0 });
    expect(calculateBasePoints(current)).toBeGreaterThan(0);
    expect(componentPointsText(current)).toBe("0.00");
    expect(
      isChanged(
        componentPointsText(current),
        componentPointsText(previous),
        false,
      ),
    ).toBe(false);
  });

  it("highlights points that really changed", () => {
    const current = component({ degreeOfCompletion: 1 });
    const previous = component({ id: 2, degreeOfCompletion: 0 });
    expect(
      isChanged(
        componentPointsText(current),
        componentPointsText(previous),
        false,
      ),
    ).toBe(true);
  });
});

describe("buildPreviousComponentsMap", () => {
  it("includes the subcomponents nested under their parents", () => {
    const sub = subComponent({ id: 11 });
    const parent = component({ id: 1, subComponents: [sub] });
    const other = component({ id: 2 });

    const map = buildPreviousComponentsMap(project([parent, other]));

    expect(Object.keys(map).sort()).toEqual(["1", "11", "2"]);
    expect(map[11]).toBe(sub);
  });
});

describe("findPreviousSubComponent", () => {
  const previousSub = subComponent({
    id: 11,
    subComponentType: "UI-B",
    className: "Interface service to other applications",
  });
  const otherPreviousSub = subComponent({
    id: 12,
    subComponentType: "B-UI",
    className: "Interface service from other applications",
  });
  const previousParent = component({
    id: 1,
    subComponents: [otherPreviousSub, previousSub],
  });
  const map = buildPreviousComponentsMap(project([previousParent]));

  it("follows previousFCId when it is set", () => {
    const sub = subComponent({ id: 21, previousFCId: 12 });
    expect(findPreviousSubComponent(sub, previousParent, map)).toBe(
      otherPreviousSub,
    );
  });

  it("falls back to the previous parent's subcomponent of the same kind when previousFCId is null", () => {
    const sub = subComponent({
      id: -1001,
      previousFCId: null,
      subComponentType: "UI-B",
      className: "Interface service to other applications",
    });
    expect(findPreviousSubComponent(sub, previousParent, map)).toBe(
      previousSub,
    );
  });

  it("returns null for a subcomponent that has no counterpart", () => {
    const sub = subComponent({ id: -1002, subComponentType: "D-B" });
    expect(findPreviousSubComponent(sub, previousParent, map)).toBeNull();
    expect(findPreviousSubComponent(sub, null, map)).toBeNull();
  });
});
