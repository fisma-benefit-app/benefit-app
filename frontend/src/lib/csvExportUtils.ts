import { TGenericComponentKeys } from "./printUtils";

import {
  calculateTotalPoints,
  calculateTotalPossiblePoints,
  calculateComponentsWithPoints,
  calculateBasePoints,
} from "./centralizedCalculations.ts";

import { Project, TGenericComponent } from "./types";

export const convertToCSV = (
  rows: Record<string, unknown>[],
  translations: Record<string, string>,
  delimiter = ";",
) => {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]).filter(
    (key) =>
      ![
        // Exclusion list for CSV export
        "id",
        "orderPosition",
        "previousFCId",
        "functionalMultiplier",
        "isMLA",
        "parentFCId",
        "isReadonly",
      ].includes(key),
  );

  const headerRow = headers.map((h) => translations[h] || h).join(delimiter);

  const encodeCell = (v: unknown) => {
    if (v == null) return "";
    let s = String(v).replace(/"/g, '""');

    // Change decimal delimiters so excel doesn't turn them into dates
    // TODO: This might need to be adjusted for different locales
    if (
      typeof v === "number" ||
      (!isNaN(Number(v)) && v.toString().trim() !== "")
    ) {
      s = s.replace(".", ",");
    }

    return s.includes(delimiter) || /["\r\n]/.test(s) ? `"${s}"` : s;
  };

  const data = rows.map((r) =>
    headers.map((h) => encodeCell(r[h])).join(delimiter),
  );

  return [headerRow, ...data].join("\r\n");
};

export const downloadCSV = (csvData: string, filename = "data.csv") => {
  const BOM = "\uFEFF";
  const csvWithBOM = BOM + csvData;

  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const encodeComponentForCSV = (
  component: TGenericComponent,
  delimiter: string = ";",
  classNameTranslations: Record<string, string> = {},
  componentTypeTranslations: Record<string, string> = {},
) => {
  const escapeCsv = (value?: string | null) => {
    if (value == null) return "";

    // Escape quotes by doubling them
    const escaped = value.replace(/"/g, '""');

    // If the value contains quotes, delimiter, or newlines, wrap in quotes
    const needsQuotes =
      escaped.includes('"') || value.includes(delimiter) || /\r|\n/.test(value);
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const formatSubcomponents = (subComponents?: TGenericComponent[]) => {
    if (!Array.isArray(subComponents)) return "";

    return subComponents
      .map((sc) => sc.title ?? "")
      .filter(Boolean)
      .join(", ");
  };

  return {
    ...component,
    subComponents: escapeCsv(formatSubcomponents(component.subComponents)),
    title: escapeCsv(component.title),
    description: escapeCsv(component.description),
    className: escapeCsv(
      component.className
        ? classNameTranslations[component.className] || component.className
        : "",
    ),
    componentType: escapeCsv(
      component.componentType
        ? componentTypeTranslations[component.componentType] ||
            component.componentType
        : "",
    ),
    totalPossiblePoints: calculateBasePoints(component).toFixed(2),
  };
};

export const encodeSummaryRowForCSV = (
  functionalPoints?: number,
  totalPoints?: number,
) => {
  // Dynamically generate empty fields for all TGenericComponent keys except summary fields
  const summaryRow: Record<string, string | undefined> = {};

  TGenericComponentKeys.forEach((key) => {
    summaryRow[key] = "";
  });
  summaryRow["functionalPoints"] = functionalPoints?.toFixed(2);
  summaryRow["totalPossiblePoints"] = totalPoints?.toFixed(2);

  return summaryRow;
};

export const downloadProjectComponentsCsv = async (
  project: Project,
  translations: Record<string, string>,
  classNameTranslations: Record<string, string>,
  componentTypeTranslations: Record<string, string>,
) => {
  const projectWithPoints = {
    ...project,
    functionalComponents: calculateComponentsWithPoints(
      project.functionalComponents,
    ),
  };

  const allComponentsForTotals: TGenericComponent[] = [];

  for (const c of project.functionalComponents) {
    allComponentsForTotals.push(c);

    if (Array.isArray(c.subComponents)) {
      allComponentsForTotals.push(...c.subComponents);
    }
  }

  const functionalPoints = calculateTotalPoints(allComponentsForTotals);
  const totalPoints = calculateTotalPossiblePoints(allComponentsForTotals);

  const componentsAndProjectTotals: Record<string, unknown>[] = [];

  const subComponentsList: Record<string, unknown>[] = [];

  for (const c of projectWithPoints.functionalComponents) {
    componentsAndProjectTotals.push(
      encodeComponentForCSV(
        c,
        ";",
        classNameTranslations,
        componentTypeTranslations,
      ),
    );

    if (Array.isArray(c.subComponents)) {
      for (const sub of c.subComponents) {
        subComponentsList.push(
          encodeComponentForCSV(
            { ...sub, parentFCId: c.id },
            ";",
            classNameTranslations,
            componentTypeTranslations,
          ),
        );
      }
    }
  }

  componentsAndProjectTotals.push(...subComponentsList);

  // Adds summary
  componentsAndProjectTotals.push(
    encodeSummaryRowForCSV(functionalPoints, totalPoints),
  );

  const csvData = convertToCSV(componentsAndProjectTotals, translations, ";");
  downloadCSV(csvData, `${project.projectName}-v${project.version}.csv`);
};
