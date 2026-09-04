import { CommentResponse, Project, TGenericComponent } from "./types";
import {
  calculateComponentPointsWithMultiplier,
  calculateComponentPoints,
  calculateTotalPoints,
  calculateTotalPossiblePoints,
  calculateBasePoints,
  calculateComponentsWithPoints,
  calculateMLALayerDetails,
  calculateMLAMessageCounts,
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

// Calculation functions moved to centralizedCalculations.ts

const getAllComponents = (
  components: TGenericComponent[],
): TGenericComponent[] => {
  return components.flatMap((comp) => [comp, ...(comp.subComponents || [])]);
};

export const generateCalculationReportPDF = (
  project: Project,
  oldProject: Project,
  printUtilsTranslation: Record<string, string> = {},
  classNameTranslation: Record<string, string> = {},
  componentTypeTranslation: Record<string, string> = {},
) => {
  const isFirstVersion = project.version === 1;

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
    span.className = !isFirstVersion &&
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
      printUtilsTranslation.lastEditedDate,
      dateLocalizer(project.updatedAt),
      dateLocalizer(oldProject.updatedAt),
    ],
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
      calculateTotalPoints(allCurrentComponents).toFixed(2),
      calculateTotalPoints(allOldComponents).toFixed(2),
    ),
  );
  totalRow.appendChild(
    createComparisonCell(
      doc,
      calculateTotalPossiblePoints(allCurrentComponents).toFixed(2),
      calculateTotalPossiblePoints(allOldComponents).toFixed(2),
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
      calculateTotalPoints(project.functionalComponents).toFixed(2),
      calculateTotalPoints(oldProject.functionalComponents).toFixed(2),
    ),
  );
  totalRowWithoutSubcomponents.appendChild(
    createComparisonCell(
      doc,
      calculateTotalPossiblePoints(project.functionalComponents).toFixed(2),
      calculateTotalPossiblePoints(oldProject.functionalComponents).toFixed(2),
    ),
  );

  tfoot.appendChild(totalRow);
  tfoot.appendChild(totalRowWithoutSubcomponents);

  table.appendChild(thead);
  table.appendChild(tbody);
  table.appendChild(tfoot);

  container.appendChild(heading);
  container.appendChild(projectInfo);
  container.appendChild(table);

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

export const generateOverviewPDF = (
  project: Project,
  previousProject?: Project,
  language: "fi" | "en" = "fi",
  classNameTranslation: Record<string, string> = {},
  componentTypeTranslation: Record<string, string> = {},
): void => {
  const allComponents = getAllComponents(project.functionalComponents);
  const previousComponents = previousProject
    ? getAllComponents(previousProject.functionalComponents)
    : [];
  const previousById = new Map(
    previousComponents.map((component) => [component.id, component]),
  );
  const formatNumber = (value: number) => value.toFixed(2);
  const delta = (current: number, previous?: number) => {
    if (previous === undefined || current === previous) return "";
    const difference = current - previous;
    return ` <span class="delta">(${difference >= 0 ? "+" : ""}${formatNumber(difference)})</span>`;
  };
  const value = (
    current: string | number | null | undefined,
    previous?: string | number | null,
  ) => {
    const currentText = current == null ? "" : String(current);
    const previousText = previous == null ? "" : String(previous);
    return currentText === previousText
      ? escapeHtmlForSummary(currentText)
      : `<strong class="changed">${escapeHtmlForSummary(currentText)}</strong>`;
  };
  const pointValue = (component: TGenericComponent) =>
    calculateComponentPoints(component);
  const currentPoints = new Map(
    allComponents.map((component) => [component.id, pointValue(component)]),
  );
  const previousPoints = new Map(
    previousComponents.map((component) => [
      component.id,
      pointValue(component),
    ]),
  );
  const totalPoints = allComponents.reduce(
    (sum, component) => sum + currentPoints.get(component.id)!,
    0,
  );
  const previousTotalPoints = previousProject
    ? previousComponents.reduce(
        (sum, component) => sum + previousPoints.get(component.id)!,
        0,
      )
    : undefined;
  const previousGroupTotals = new Map<string, number>();
  if (previousProject) {
    previousComponents.forEach((component) => {
      const rawClassName = component.className || "Unspecified";
      const className = classNameTranslation[rawClassName] || rawClassName;
      const rawComponentType = component.componentType || "Unspecified";
      const componentType =
        componentTypeTranslation[rawComponentType] || rawComponentType;
      const classKey = `className:${className}`;
      const typeKey = `componentType:${componentType}`;
      previousGroupTotals.set(
        classKey,
        (previousGroupTotals.get(classKey) || 0) +
          previousPoints.get(component.id)!,
      );
      previousGroupTotals.set(
        typeKey,
        (previousGroupTotals.get(typeKey) || 0) +
          previousPoints.get(component.id)!,
      );
    });
  }
  const componentRows = allComponents
    .map((component) => {
      const previous = component.previousFCId
        ? previousById.get(component.previousFCId)
        : undefined;
      const componentPointValue = currentPoints.get(component.id)!;
      const previousPointValue = previous
        ? previousPoints.get(previous.id)
        : undefined;
      return `<tr>
      <td>${value(component.title, previous?.title)}</td>
      <td>${value(classNameTranslation[component.className] || component.className, previous?.className ? classNameTranslation[previous.className] || previous.className : previous?.className)}</td>
      <td>${value(componentTypeTranslation[component.componentType || ""] || component.componentType, previous?.componentType ? componentTypeTranslation[previous.componentType] || previous.componentType : previous?.componentType)}</td>
      <td>${value(component.dataElements, previous?.dataElements)}</td>
      <td>${value(component.readingReferences, previous?.readingReferences)}</td>
      <td>${value(component.writingReferences, previous?.writingReferences)}</td>
      <td>${formatNumber(componentPointValue)}${delta(componentPointValue, previousPointValue)}</td>
      <td>${value(component.degreeOfCompletion, previous?.degreeOfCompletion)}</td>
    </tr>`;
    })
    .join("");
  const grouped = (key: "className" | "componentType") => {
    const groups = new Map<string, TGenericComponent[]>();
    allComponents.forEach((component) => {
      const rawGroup = component[key] || "Unspecified";
      const group =
        key === "className"
          ? classNameTranslation[rawGroup] || rawGroup
          : componentTypeTranslation[rawGroup] || rawGroup;
      groups.set(group, [...(groups.get(group) || []), component]);
    });
    return [...groups.entries()]
      .map(([name, components]) => {
        const previousGroupTotal = previousProject
          ? previousGroupTotals.get(`${key}:${name}`) || 0
          : undefined;
        const total = components.reduce(
          (sum, component) => sum + currentPoints.get(component.id)!,
          0,
        );
        return `<tr><td>${escapeHtmlForSummary(name)}</td><td>${components.length}</td><td>${formatNumber(total)}${delta(total, previousGroupTotal)}</td></tr>`;
      })
      .join("");
  };
  const layers = calculateMLALayerDetails(project.functionalComponents);
  const messages = calculateMLAMessageCounts(project.functionalComponents);
  const reportDate = project.calculationDate
    ? project.calculationDate.split("-").reverse().join(".")
    : "";
  const labels =
    language === "fi"
      ? {
          calculation: "Toiminnallisen koon laskenta",
          total: "Kokonaislaajuus",
          uiLayer: "Käyttöliittymäkerros",
          businessLayer: "Välikerros",
          databaseLayer: "Tietovarastokerros",
          interfaces: "liittymää",
          functions: "toimintoa",
          concepts: "käsitettä",
          actions: "Toiminnot",
          feature: "Toiminnon nimi",
          functionClass: "Toimintoluokka",
          functionType: "Toimintotyyppi",
          dataElements: "Tietoelementit",
          readingReferences: "Lukuviittaukset",
          writingReferences: "Kirjoitusviittaukset",
          actionPoints: "Toimintopisteet",
          completion: "Valmistumisaste",
          aggregates: "Koosteet ja tärkeät muutokset",
          classAggregate: "Toimintoluokat",
          typeAggregate: "Toimintotyypit",
          count: "Lukumäärä",
          explanation: "Laskennan selitys ja tärkeät muutokset",
          noFunctions: "Ei laskettavia toimintoja",
          changed:
            "Muuttuneet arvot on korostettu. Suluissa oleva luku kertoo eron edelliseen versioon.",
        }
      : {
          calculation: "Functional size calculation",
          total: "Total size",
          uiLayer: "User interface layer",
          businessLayer: "Business layer",
          databaseLayer: "Data storage layer",
          interfaces: "interfaces",
          functions: "functions",
          concepts: "concepts",
          actions: "Activities",
          feature: "Feature name",
          functionClass: "Function class",
          functionType: "Function type",
          dataElements: "Data elements",
          readingReferences: "Reading references",
          writingReferences: "Writing references",
          actionPoints: "Action points",
          completion: "Degree of completion",
          aggregates: "Aggregates and important changes",
          classAggregate: "Function classes",
          typeAggregate: "Function types",
          count: "Count",
          explanation: "Calculation explanation and important changes",
          noFunctions: "No calculable activities",
          changed:
            "Changed values are highlighted. The number in parentheses shows the difference from the previous version.",
        };
  const pointUnit = language === "fi" ? "TP" : "FP";
  const year = project.calculationDate?.slice(0, 4) || new Date().getFullYear();
  const filename = `${project.projectName}-Toiminnallisen-laajuuden-yhteenveto-${project.version}-${year}.pdf`;
  const html = `<!doctype html><html lang="${language}"><head><meta charset="UTF-8"><title>${escapeHtmlForSummary(filename)}</title><style>
    @page{size:A4;margin:12mm}*{box-sizing:border-box}body{font:10px Arial,sans-serif;color:#202020;margin:0}.page{height:273mm;break-after:page;position:relative}.page:last-child{break-after:auto}h1{font-size:30px;line-height:1.2;color:#202020;margin:0 0 12mm}.report-date{display:block;font-size:22px;font-weight:normal;margin-top:4mm}h2{font-size:16px;color:#25205f;border-bottom:2px solid #25205f;padding-bottom:3px}table{width:100%;border-collapse:collapse;margin:5mm 0}th,td{border:1px solid #999;padding:3px;text-align:left;vertical-align:top}th{background:#e9e8ef;font-size:9px}.changed{color:#b00020}.delta{color:#087443;font-weight:bold;white-space:nowrap}.report-contact,.notes{white-space:pre-wrap;border:1px solid #999;padding:6mm;min-height:25mm}.footer{position:absolute;bottom:0;border:1px solid #333;padding:4mm;width:100%;font-size:9px}.architecture{text-align:center;margin:4mm auto 2mm;max-width:145mm}.architecture-total{font-size:16px;font-weight:bold;margin-bottom:5mm}.architecture-grid{display:grid;grid-template-columns:35mm 1fr 35mm;grid-template-rows:30mm 18mm 35mm 18mm 38mm;align-items:center;justify-items:center}.layer{width:62mm;min-height:30mm;border:1px solid #5b8cc5;background:linear-gradient(135deg,#b9d2ec,#75a6d5);padding:5mm;text-align:center;font-size:11px;display:flex;flex-direction:column;justify-content:center}.layer strong{font-size:14px}.layer-ui{grid-column:2;grid-row:1;border-radius:8mm}.layer-business{grid-column:2;grid-row:3;width:68mm;min-height:35mm}.layer-database{grid-column:2;grid-row:5;border-radius:50% / 15%;min-height:38mm}.junction{font-size:9px;border:1px solid #5b8cc5;background:#e5eff9;padding:2mm;width:27mm;position:relative}.junction::after{content:"";position:absolute;border:6mm solid transparent}.junction-up{grid-column:2;grid-row:2}.junction-up::after{border-bottom-color:#5b8cc5;top:-12mm;left:8mm}.junction-down{grid-column:2;grid-row:4}.junction-down::after{border-top-color:#5b8cc5;bottom:-12mm;left:8mm}.junction-left{grid-column:1;grid-row:3}.junction-left::after{border-left-color:#5b8cc5;right:-12mm;top:2mm}.junction-right{grid-column:3;grid-row:3}.junction-right::after{border-right-color:#5b8cc5;left:-12mm;top:2mm}.small{font-size:9px}
    @media print{body{print-color-adjust:exact}.page{height:273mm}}
  </style></head><body>
    <section class="page"><h1>${escapeHtmlForSummary(project.projectName)} - ${language === "fi" ? "toiminnallisen laajuuden yhteenveto" : "functional size overview"}<span class="report-date">${reportDate}</span></h1><div class="report-contact">${escapeHtmlForSummary(project.reportContactDetails)}</div><div class="footer">FiSMA 1.1 Toiminnallisen koon mittaamisen menetelmä ISO/IEC 29881:2010</div></section>
    <section class="page"><h2>${labels.calculation}</h2><div class="architecture"><div class="architecture-total">${labels.total} ${formatNumber(totalPoints)} ${pointUnit}${delta(totalPoints, previousTotalPoints)}</div><div class="architecture-grid"><div class="layer layer-ui">${labels.uiLayer}<strong>${layers.ui.points.toFixed(2)} ${pointUnit}</strong><span>${layers.ui.count} ${labels.functions}</span></div><div class="junction junction-up">${messages.uiToBusiness + messages.businessToUi} ${labels.interfaces}</div><div class="junction junction-left">${messages.uiToBusiness} ${labels.interfaces}<br>${language === "fi" ? "sisään" : "in"}</div><div class="layer layer-business">${labels.businessLayer}<strong>${layers.business.points.toFixed(2)} ${pointUnit}</strong><span>${language === "fi" ? "Algoritmiset toiminnot" : "Algorithmic activities"}</span></div><div class="junction junction-right">${messages.businessToUi} ${labels.interfaces}<br>${language === "fi" ? "ulos" : "out"}</div><div class="junction junction-down">${messages.businessToDatabase + messages.databaseToBusiness} ${labels.interfaces}</div><div class="layer layer-database">${labels.databaseLayer}<strong>${layers.database.points.toFixed(2)} ${pointUnit}</strong><span>${layers.database.count} ${labels.concepts}</span></div></div></div><h3>${labels.actions}</h3><table><thead><tr><th>${labels.feature}</th><th>${labels.functionClass}</th><th>${labels.functionType}</th><th>${labels.dataElements}</th><th>${labels.readingReferences}</th><th>${labels.writingReferences}</th><th>${labels.actionPoints}</th><th>${labels.completion}</th></tr></thead><tbody>${componentRows || `<tr><td colspan="8">${labels.noFunctions}</td></tr>`}</tbody></table></section>
    <section class="page"><h2>${labels.aggregates}</h2><h3>${labels.classAggregate}</h3><table><thead><tr><th>${labels.functionClass}</th><th>${labels.count}</th><th>${labels.actionPoints}</th></tr></thead><tbody>${grouped("className")}</tbody></table><h3>${labels.typeAggregate}</h3><table><thead><tr><th>${labels.functionType}</th><th>${labels.count}</th><th>${labels.actionPoints}</th></tr></thead><tbody>${grouped("componentType")}</tbody></table><h3>${labels.explanation}</h3><div class="notes">${escapeHtmlForSummary(project.reportNotes)}</div><p class="small">${labels.changed}</p></section>
  </body></html>`;
  const printWindow = window.open("", "_blank", "width=1000,height=800");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.document.title = filename;
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
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
