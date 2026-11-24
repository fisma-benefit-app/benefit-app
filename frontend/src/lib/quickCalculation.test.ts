import { describe, expect, it } from "vitest";
import { calculateGrandTotalPossiblePoints } from "./centralizedCalculations.ts";
import {
  buildQuickCalculationComponents,
  calculateQuickCalculationSize,
  defaultQuickCalculationAverages,
  type QuickCalculationArchitecture,
} from "./quickCalculation.ts";

const counts = {
  query: 1,
  input: 2,
  output: 3,
  interfaceTo: 4,
  interfaceFrom: 5,
  entity: 6,
  rule: 7,
};

describe("quick calculation architectures", () => {
  // Rounded results from the original FiSMA Quick Calculator for these counts.
  it.each<[QuickCalculationArchitecture, number]>([
    ["singlePlatform", 143],
    ["isolatedUi", 195],
    ["isolatedDatabase", 247],
    ["threeLayer", 299],
  ])("matches the original FiSMA estimate for %s", (architecture, expected) => {
    const size = calculateQuickCalculationSize(
      counts,
      defaultQuickCalculationAverages,
      architecture,
    );

    expect(Math.round(size)).toBe(expected);
  });

  it("uses edited message parameters for the selected architecture", () => {
    const averages = {
      ...defaultQuickCalculationAverages,
      interfaceTo: {
        ...defaultQuickCalculationAverages.interfaceTo,
        dataElements: 22,
      },
    };
    const estimate = (parameters: typeof averages) =>
      calculateQuickCalculationSize(counts, parameters, "isolatedUi");

    // Seven extra data elements add one point to each sending message.
    // There are four external messages and two per query or input screen.
    expect(
      estimate(averages) - estimate(defaultQuickCalculationAverages),
    ).toBeCloseTo(10);
  });

  it("generates projects with three-layer messages", () => {
    const components = buildQuickCalculationComponents(
      counts,
      defaultQuickCalculationAverages,
      {
        query: "Query",
        input: "Input",
        output: "Output",
        interfaceTo: "Send",
        interfaceFrom: "Receive",
        entity: "Entity",
        rule: "Rule",
      },
      0,
    );

    expect(components.filter(({ isMLA }) => isMLA)).toHaveLength(9);
    expect(
      components.flatMap(({ subComponents }) => subComponents ?? []),
    ).toHaveLength(36);
    expect(Math.round(calculateGrandTotalPossiblePoints(components))).toBe(299);
  });
});
