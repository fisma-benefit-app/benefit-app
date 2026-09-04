import { CommentResponse, Project, TGenericComponent } from "./types";
import {
  calculateComponentPointsWithMultiplier,
  calculateTotalPoints,
  calculateTotalPossiblePoints,
  calculateBasePoints,
  calculateComponentsWithPoints,
  calculateProjectPointsByLayer,
  calculatePossiblePointsByLayer,
} from "./centralizedCalculations.ts";

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

const TGenericComponentKeys: (keyof TGenericComponent)[] = Object.keys(
  {} as TGenericComponent,
).filter(
  (k) => !["functionalPoints", "totalPossiblePoints"].includes(k),
) as (keyof TGenericComponent)[];

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

// Localizes the date to a readable form
const dateLocalizer = (insertedDate: string) => {
  return new Date(insertedDate)
    .toLocaleTimeString("fi-FI", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace("klo", "");
};

const dateOnlyLocalizer = (insertedDate?: string | null) => {
  if (!insertedDate) return null;

  return new Date(`${insertedDate}T00:00:00`).toLocaleDateString("fi-FI", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// Calculation functions moved to centralizedCalculations.ts

const getAllComponents = (
  components: TGenericComponent[],
): TGenericComponent[] => {
  return components.flatMap((comp) => [comp, ...(comp.subComponents || [])]);
};

export const createPdf = (
  project: Project,
  oldProject: Project,
  printUtilsTranslation: Record<string, string> = {},
  classNameTranslation: Record<string, string> = {},
  componentTypeTranslation: Record<string, string> = {},
) => {
  // Maps functional components for previous project so that they can be compared to the current project
  const previousComponentsMap = Object.fromEntries(
    oldProject.functionalComponents.map((comp) => [comp.id, comp]),
  );

  // Used for points calculation, so that even subcomponent points are added up. In case this isn't needed, easy to change
  const allCurrentComponents = getAllComponents(project.functionalComponents);
  const allOldComponents = getAllComponents(oldProject.functionalComponents);

  const createElementWithText = <K extends keyof HTMLElementTagNameMap>(
    doc: Document,
    tag: K,
    text: string,
    className?: string,
  ): HTMLElementTagNameMap[K] => {
    const element = doc.createElement(tag);
    if (className) {
      element.className = className;
    }
    element.textContent = text;
    return element;
  };

  const createComparisonSpan = (
    doc: Document,
    currentValue: string | number | null | undefined,
    prevValue: string | number | null | undefined,
  ) => {
    const value = prevValue !== currentValue ? currentValue : prevValue;
    const span = doc.createElement("span");
    span.className =
      prevValue !== currentValue ? "project-data highlighted" : "project-data";
    span.textContent = value != null ? String(value) : "";
    return span;
  };

  const createComparisonCell = (
    doc: Document,
    currentValue: string | number | null | undefined,
    prevValue: string | number | null | undefined,
  ) => {
    const cell = doc.createElement("td");
    cell.appendChild(createComparisonSpan(doc, currentValue, prevValue));
    return cell;
  };

  const translateClassName = (className: string) =>
    classNameTranslation[className] || className;

  const translateComponentType = (componentType?: string | null) =>
    componentType
      ? componentTypeTranslation[componentType] || componentType
      : "";

  const printingWindow = window.open("", "_blank", "width=800,height=600");
  if (!printingWindow) {
    return;
  }

  const doc = printingWindow.document;
  doc.title = `${project.projectName}-v${project.version}`;
  if (doc.documentElement) {
    doc.documentElement.lang = "fi";
  }

  const style = doc.createElement("style");
  style.textContent = `
      .project-data {
        font-weight: normal;
      }
      .highlighted {
        color: blue;
        font-weight: bold;
      }
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { text-align: center; }
      .project-info { margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #000; padding: 5px; text-align: left; }
      th { background-color: #f2f2f2; }
      .total-row { font-weight: bold; background-color: #ddd; }
      .subcomponent-row td {
        padding-left: 30px;
        background-color: #fafafa;
      }
      @media print {
        @page {
          margin: 5mm 5mm 5mm 0mm;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-row-group;
        }
        tr {
          page-break-inside: avoid;
        }
        .project-info {
          page-break-after: avoid;
        }
        .total-row {
          break-inside: avoid;
          page-break-before: avoid;
        }
      }
    `;

  const container = doc.createElement("div");
  container.className = "pdf-container";

  const heading = createElementWithText(
    doc,
    "h1",
    `${printUtilsTranslation.projectReport}: ${project.projectName}-v${project.version}`,
  );

  const projectInfo = doc.createElement("div");
  projectInfo.className = "project-info";
  const infoRows = [
    [printUtilsTranslation.projectId, project.id, oldProject.id],
    [printUtilsTranslation.version, project.version, oldProject.version],
    [
      printUtilsTranslation.createdDate,
      dateLocalizer(project.createdAt),
      dateLocalizer(oldProject.createdAt),
    ],
    [
      printUtilsTranslation.versionCreatedDate,
      dateLocalizer(project.versionCreatedAt),
      dateLocalizer(oldProject.versionCreatedAt),
    ],
    [
      printUtilsTranslation.calculationDate || "Calculation Date",
      project.calculationDate ? dateLocalizer(project.calculationDate): "N/A",
      oldProject.calculationDate ? dateLocalizer(oldProject.calculationDate) : "N/A",
    ],
    [
      printUtilsTranslation.lastEditedDate,
      dateLocalizer(project.updatedAt),
      dateLocalizer(oldProject.updatedAt),
    ]
  ];

  infoRows.forEach(([label, currentValue, prevValue]) => {
    const paragraph = doc.createElement("p");
    const strong = createElementWithText(doc, "strong", `${label}: `);
    paragraph.appendChild(strong);
    paragraph.appendChild(createComparisonSpan(doc, currentValue, prevValue));
    projectInfo.appendChild(paragraph);
  });

  const table = doc.createElement("table");
  const thead = doc.createElement("thead");
  const headerRow = doc.createElement("tr");
  [
    printUtilsTranslation.title,
    printUtilsTranslation.className,
    printUtilsTranslation.componentType,
    printUtilsTranslation.dataElements,
    printUtilsTranslation.readingReferences,
    printUtilsTranslation.writingReferences,
    printUtilsTranslation.operations,
    printUtilsTranslation.degreeOfCompletion,
    printUtilsTranslation.functionalPoints,
    printUtilsTranslation.totalPossiblePoints,
  ].forEach((headerText) => {
    headerRow.appendChild(createElementWithText(doc, "th", headerText));
  });
  thead.appendChild(headerRow);

  const tbody = doc.createElement("tbody");
  project.functionalComponents.forEach((comp) => {
    const prevComp = comp.previousFCId
      ? previousComponentsMap[comp.previousFCId]
      : null;

    const row = doc.createElement("tr");
    row.appendChild(
      createComparisonCell(doc, comp.title, prevComp?.title ?? null),
    );
    row.appendChild(
      createComparisonCell(
        doc,
        translateClassName(comp.className),
        prevComp ? translateClassName(prevComp.className) : null,
      ),
    );
    row.appendChild(
      createComparisonCell(
        doc,
        translateComponentType(comp.componentType),
        prevComp ? translateComponentType(prevComp.componentType) : null,
      ),
    );
    row.appendChild(
      createComparisonCell(
        doc,
        comp.dataElements,
        prevComp?.dataElements ?? null,
      ),
    );
    row.appendChild(
      createComparisonCell(
        doc,
        comp.readingReferences,
        prevComp?.readingReferences ?? null,
      ),
    );
    row.appendChild(
      createComparisonCell(
        doc,
        comp.writingReferences,
        prevComp?.writingReferences ?? null,
      ),
    );
    row.appendChild(
      createComparisonCell(doc, comp.operations, prevComp?.operations ?? null),
    );
    row.appendChild(
      createComparisonCell(
        doc,
        comp.degreeOfCompletion,
        prevComp?.degreeOfCompletion ?? null,
      ),
    );
    row.appendChild(
      createComparisonCell(
        doc,
        calculateComponentPointsWithMultiplier(
          comp || null,
          comp.degreeOfCompletion,
        ).toFixed(2),
        calculateComponentPointsWithMultiplier(
          prevComp || null,
          prevComp?.degreeOfCompletion || null,
        ).toFixed(2),
      ),
    );
    row.appendChild(
      createComparisonCell(
        doc,
        calculateBasePoints(comp).toFixed(2),
        prevComp ? calculateBasePoints(prevComp).toFixed(2) : "0.00",
      ),
    );
    tbody.appendChild(row);

    if (Array.isArray(comp.subComponents)) {
      comp.subComponents.forEach((sub) => {
        const prevSub = sub.previousFCId
          ? previousComponentsMap[sub.previousFCId]
          : null;
        const subRow = doc.createElement("tr");
        subRow.className = "subcomponent-row";
        subRow.appendChild(
          createComparisonCell(doc, sub.title, prevSub?.title ?? null),
        );
        subRow.appendChild(
          createComparisonCell(
            doc,
            translateClassName(sub.className),
            prevSub ? translateClassName(prevSub.className) : null,
          ),
        );
        subRow.appendChild(
          createComparisonCell(
            doc,
            translateComponentType(sub.componentType),
            prevSub ? translateComponentType(prevSub.componentType) : null,
          ),
        );
        subRow.appendChild(
          createComparisonCell(
            doc,
            sub.dataElements,
            prevSub?.dataElements ?? null,
          ),
        );
        subRow.appendChild(
          createComparisonCell(
            doc,
            sub.readingReferences,
            prevSub?.readingReferences ?? null,
          ),
        );
        subRow.appendChild(
          createComparisonCell(
            doc,
            sub.writingReferences,
            prevSub?.writingReferences ?? null,
          ),
        );
        subRow.appendChild(
          createComparisonCell(
            doc,
            sub.operations,
            prevSub?.operations ?? null,
          ),
        );
        subRow.appendChild(
          createComparisonCell(
            doc,
            sub.degreeOfCompletion,
            prevSub?.degreeOfCompletion ?? null,
          ),
        );
        subRow.appendChild(
          createComparisonCell(
            doc,
            calculateComponentPointsWithMultiplier(
              sub || null,
              sub.degreeOfCompletion,
            ).toFixed(2),
            calculateComponentPointsWithMultiplier(
              prevSub || null,
              prevSub?.degreeOfCompletion || null,
            ).toFixed(2),
          ),
        );
        subRow.appendChild(
          createComparisonCell(
            doc,
            calculateBasePoints(sub).toFixed(2),
            prevSub ? calculateBasePoints(prevSub).toFixed(2) : "0.00",
          ),
        );
        tbody.appendChild(subRow);
      });
    }
  });

  
  // --- HELPER FUNCTION: Compare the change ---
  const formatTotalWithDiff = (current: number, previous: number) => {
    if (current === previous)
      return current.toFixed(2);

    const diff = current - previous;
    const sign = diff > 0 ? "+" : "-"

    return `${current.toFixed(2)} FP (${sign}${diff.toFixed(2)} FP)`;
  }

  const currentTotal = calculateTotalPoints(allCurrentComponents);
  const oldTotal = calculateTotalPoints(allOldComponents);
  const currentPossible = calculateTotalPossiblePoints(allCurrentComponents);
  const oldPossible = calculateTotalPossiblePoints(allOldComponents);

  const currentTotalNoSub = calculateTotalPoints(project.functionalComponents);
  const oldTotalNoSub = calculateTotalPoints(oldProject.functionalComponents);
  const currentPossibleNoSub = calculateTotalPossiblePoints(project.functionalComponents);
  const oldPossibleNoSub = calculateTotalPossiblePoints(oldProject.functionalComponents);


  const tfoot = doc.createElement("tfoot");
  const totalRow = doc.createElement("tr");
  totalRow.className = "total-row";
  const totalLabelCell = doc.createElement("td");
  totalLabelCell.colSpan = 8;
  totalLabelCell.appendChild(
    createElementWithText(
      doc,
      "b",
      printUtilsTranslation.totalFunctionalPoints,
    ),
  );
  totalRow.appendChild(totalLabelCell);
  totalRow.appendChild(
    createComparisonCell(
      doc,
      formatTotalWithDiff(currentTotal, oldTotal),
      currentTotal === oldTotal ? currentTotal.toFixed(2) : null,
    ),
  );
  totalRow.appendChild(
    createComparisonCell(
      doc,
      formatTotalWithDiff(currentPossible, oldPossible),
      currentPossible === oldPossible ? currentPossible.toFixed(2) : null
    ),
  );

  const totalRowWithoutSubcomponents = doc.createElement("tr");
  totalRowWithoutSubcomponents.className = "total-row";
  const totalWithoutSubLabelCell = doc.createElement("td");
  totalWithoutSubLabelCell.colSpan = 8;
  totalWithoutSubLabelCell.appendChild(
    createElementWithText(
      doc,
      "b",
      printUtilsTranslation.totalFunctionalPointsWithoutSubcomponents,
    ),
  );
  totalRowWithoutSubcomponents.appendChild(totalWithoutSubLabelCell);
  totalRowWithoutSubcomponents.appendChild(
    createComparisonCell(
      doc,
      formatTotalWithDiff(currentTotalNoSub, oldTotalNoSub),
      currentTotalNoSub === oldTotalNoSub ? currentTotalNoSub.toFixed(2) : null
    ),
  );
  totalRowWithoutSubcomponents.appendChild(
    createComparisonCell(
      doc,
      formatTotalWithDiff(currentPossibleNoSub, oldPossibleNoSub),
      currentPossibleNoSub === oldPossibleNoSub ? currentPossibleNoSub.toFixed(2) : null
    ),
  );

  tfoot.appendChild(totalRow);
  tfoot.appendChild(totalRowWithoutSubcomponents);

  table.appendChild(thead);
  table.appendChild(tbody);
  table.appendChild(tfoot);

    // --- HELPER FUNCTION: Summary Table ---
  const createSummaryTable = (doc: Document, title: string, data: any[], headers: string[]) => {
    const wrapper = doc.createElement("div");
    wrapper.style.marginTop = "30px";
    
    const tableTitle = createElementWithText(doc, "h3", title);
    wrapper.appendChild(tableTitle);

    const tbl = doc.createElement("table");
    
    // Header
    const tHead = doc.createElement("thead");
    const hRow = doc.createElement("tr");
    headers.forEach(headerText => {
      hRow.appendChild(createElementWithText(doc, "th", headerText));
    });
    tHead.appendChild(hRow);
    tbl.appendChild(tHead);

    // Body
    const tBody = doc.createElement("tbody");
    data.forEach(rowData => {
      const row = doc.createElement("tr");
      rowData.forEach((cellData: string | number) => {
        row.appendChild(createElementWithText(doc, "td", String(cellData)));
      });
      tBody.appendChild(row);
    });
    tbl.appendChild(tBody);
    
    wrapper.appendChild(tbl);
    return wrapper;
  };

  container.appendChild(heading);
  container.appendChild(projectInfo);
  container.appendChild(table);

  // --- Summary MLA ---
  const actualLayerPoints = calculateProjectPointsByLayer(project);
  const possibleLayerPoints = calculatePossiblePointsByLayer(allCurrentComponents);
  const isFinnish = printUtilsTranslation.projectReport?.toLowerCase().includes("raportti") || printUtilsTranslation.projectReport?.toLowerCase().includes("projektin");

  const uiLayerLabel = isFinnish ? "Käyttöliittymäkerros (UI)" : "User Interface Layer (UI)";
  const businessLayerLabel = isFinnish ? "Välikerros (Business)" : "Business/Middle Layer";
  const dbLayerLabel = isFinnish ? "Tietokantakerros (Database)" : "Database Layer";

  const mlaData = [
    [uiLayerLabel, actualLayerPoints.userInterface.toFixed(2), possibleLayerPoints.userInterface.toFixed(2)],
    [businessLayerLabel, actualLayerPoints.business.toFixed(2), possibleLayerPoints.business.toFixed(2)],
    [dbLayerLabel, actualLayerPoints.database.toFixed(2), possibleLayerPoints.database.toFixed(2)]
  ];

  const mlaTableHeading = isFinnish 
    ? "Monikerrosarkkitehtuurin yhteenveto (MLA Totals)" 
    : "Multi-layered Architecture Summary (MLA Totals)";

  const mlaTable = createSummaryTable(
    doc, 
    mlaTableHeading, 
    mlaData, 
    [
      isFinnish ? "Kerros" : "Layer", 
      isFinnish ? "Toteutuneet FP" : "Actual FP", 
      isFinnish ? "Maksimaaliset FP (100%)" : "100% FP"
    ]
  );
  container.appendChild(mlaTable);

  // --- HELPER FUNCTION: Group by Class and Components ---
  const getSummaryDataByProperty = (
    components: any[], 
    propertyKey: string, 
    translateFn: (val: string) => string
  ) => {
    const summary: Record<string, { actual: number; possible: number }> = {};

    components.forEach((comp) => {
      const rawValue = comp[propertyKey];
      if (!rawValue) return; 

      const label = translateFn(rawValue);

      if (!summary[label]) {
        summary[label] = { actual: 0, possible: 0 };
      }

      const actualPoints = calculateComponentPointsWithMultiplier(comp || null, comp.degreeOfCompletion);
      const possiblePoints = calculateBasePoints(comp);

      summary[label].actual += actualPoints;
      summary[label].possible += possiblePoints;
    });

    return Object.entries(summary).map(([label, totals]) => [
      label,
      totals.actual.toFixed(2),
      totals.possible.toFixed(2),
    ]);
  };

  // --- CREATE SUMMARY TABLE GROUP BY CLASS ---
  const classData = getSummaryDataByProperty(allCurrentComponents, "className", translateClassName);
  
  if (classData.length > 0) {
    const classTableHeading = isFinnish 
      ? "Yhteenveto toimintoluokittain (By Class)" 
      : "Summary by Component Class";
      
    const classTable = createSummaryTable(
      doc, 
      classTableHeading, 
      classData, 
      [
        isFinnish ? "Toimintoluokka" : "Class Name", 
        isFinnish ? "Toteutuneet FP" : "Actual FP", 
        isFinnish ? "Maksimaaliset FP (100%)" : "100% FP"
      ]
    );
    container.appendChild(classTable);
  }

  // --- CREATE SUMMARY TABLE GROUP BY TYPE ---
  const typeData = getSummaryDataByProperty(allCurrentComponents, "componentType", translateComponentType);
  
  if (typeData.length > 0) {
    const typeTableHeading = isFinnish 
      ? "Yhteenveto toimintotyypeittäin (By Type)" 
      : "Summary by Component Type";
      
    const typeTable = createSummaryTable(
      doc, 
      typeTableHeading, 
      typeData, 
      [
        isFinnish ? "Toimintotyyppi" : "Component Type", 
        isFinnish ? "Toteutuneet FP" : "Actual FP", 
        isFinnish ? "Maksimaaliset FP (100%)" : "100% FP"
      ]
    );
    container.appendChild(typeTable);
  }

  if (doc.head) {
    doc.head.appendChild(style);
  }

  while (doc.body.firstChild) {
    doc.body.removeChild(doc.body.firstChild);
  }
  doc.body.appendChild(container);
  doc.close();
  printingWindow.print();
  setTimeout(() => printingWindow.close(), 500);
};

/**
 * Generoi projektin yhteenveto-PDF:n (alustava placeholder versio!)
 * Yksinkertaistettu versio nopeaa tulostusta varten
 */
export const generateProjectSummaryPDF = (
  project: Project,
  comments: CommentResponse[],
  commentsTitle: string,
): void => {
  const formattedCreatedAt = new Date(project.createdAt).toLocaleDateString(
    "fi-FI",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const formattedVersionCreatedAt = new Date(
    project.versionCreatedAt,
  ).toLocaleDateString("fi-FI", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedUpdatedAt = new Date(project.updatedAt).toLocaleDateString(
    "fi-FI",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${project.projectName} - Yhteenveto</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          padding: 40px 20px;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          border-bottom: 3px solid #1e40af;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 28px;
          color: #1e40af;
          margin-bottom: 10px;
        }
        
        .header p {
          color: #666;
          font-size: 14px;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 15px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-weight: 600;
          color: #1e40af;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        
        .info-value {
          color: #333;
          font-size: 14px;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #999;
          text-align: center;
        }

        .comments-section {
          page-break-before: always;
          margin-top: 40px;
        }

        .comment-item {
          margin-bottom: 15px;
          padding: 10px;
          background-color: #f9f9f9;
          border-left: 3px solid #1e40af;
        }

        .comment-text {
          color: #333;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        
        @media print {
          body {
            background-color: white;
            padding: 0;
          }
          
          .container {
            box-shadow: none;
            padding: 0;
          }

          .comments-section {
            page-break-before: always;
          }
          
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${escapeHtmlForSummary(project.projectName)}</h1>
          <p>Projektin yhteenveto - Luotu ${new Date().toLocaleDateString("fi-FI")}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Perustiedot</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Projektin nimi</div>
              <div class="info-value">${escapeHtmlForSummary(project.projectName)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Versio</div>
              <div class="info-value">v${project.version}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Projektin ID</div>
              <div class="info-value">${project.id}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Projektin tila</div>
              <div class="info-value">${project.active ? "Aktiivinen" : "Passiivinen"}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Aikaleima-tiedot</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Luotu</div>
              <div class="info-value">${formattedCreatedAt}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Version luotu</div>
              <div class="info-value">${formattedVersionCreatedAt}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Päivitetty</div>
              <div class="info-value">${formattedUpdatedAt}</div>
            </div>
          </div>
        </div>
        ${
          comments.length > 0
            ? `
        <div class="section comments-section">
          <div class="section-title">${escapeHtmlForSummary(commentsTitle)}</div>
          ${comments
            .map(
              (comment) =>
                `<div class="comment-item"><div class="comment-text">${escapeHtmlForSummary(
                  comment.text,
                )}</div></div>`,
            )
            .join("")}
        </div>
        `
            : ""
        }
        
        <div class="footer">
          <p>Tämä dokumentti on luotu automaattisesti järjestelmästä.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");

  if (printWindow) {
    printWindow.addEventListener("load", () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    });
  }
};

/**
 * Escape HTML-merkkejä turvallisuuden vuoksi
 */
const escapeHtmlForSummary = (text?: string | null): string => {
  if (!text) return "";
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};
