import Papa from "papaparse";
import { describe, expect, it } from "vitest";
import { convertToCSV, encodeSummaryRowForCSV } from "./csvExportUtils";

describe("convertToCSV", () => {
  it.each([
    ["equals", "=1+1"],
    ["plus", "+1"],
    ["minus", "-1.25"],
    ["at sign", "@text"],
    ["fullwidth equals", "\uFF1D1"],
    ["whitespace", " \u00a0=1"],
    ["zero-width and control characters", "\u200b\u0000=1"],
    ["tab", "\ttext"],
    ["carriage return", "\rtext"],
    ["line feed", "\ntext"],
  ])("exports a cell starting with %s as text", (_prefix, value) => {
    const csv = convertToCSV([{ title: value, description: value }], {});
    const { data, errors } = Papa.parse<string[]>(csv, { delimiter: ";" });

    expect(errors).toEqual([]);
    expect(data).toEqual([
      ["title", "description"],
      ["'" + value, "'" + value],
    ]);
  });

  it("keeps ordinary text, numeric values, and fixed-precision totals", () => {
    const totals = encodeSummaryRowForCSV(2.5, 3);
    const csv = convertToCSV(
      [
        {
          title: "  A = B",
          adjustment: -1.25,
          ...totals,
          description: 'A; "quoted"\nline',
        },
        { title: "Other" },
      ],
      {},
    );

    expect(csv).toBe(
      "title;adjustment;functionalPoints;totalPossiblePoints;description\r\n" +
        '  A = B;-1,25;2,50;3,00;"A; ""quoted""\nline"\r\n' +
        "Other;;;;",
    );
  });

  it("encodes translated headers and formula-like data with an alternate delimiter", () => {
    const csv = convertToCSV(
      [{ title: '=1,"text"\nnext' }],
      { title: "Title, translated" },
      ",",
    );

    expect(csv).toBe('"Title, translated"\r\n"\'=1,""text""\nnext"');
  });
});
