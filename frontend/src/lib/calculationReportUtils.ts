import { Project } from "./types";
import {
  calculateComponentPointsWithMultiplier,
  calculateTotalPoints,
  calculateTotalPossiblePoints,
  calculateBasePoints,
  calculateProjectPointsByLayer,
  calculatePossiblePointsByLayer,
} from "./centralizedCalculations";
import {
  createHiddenContainer,
  dateLocalizer,
  getAllComponents,
  waitForContentReady,
  downloadElementsAsPdf,
} from "./printUtils";

// const PDF_PAGE_WIDTH_MM = 210;
// const PDF_PAGE_HEIGHT_MM = 297;
//const PDF_CANVAS_MAX_PX = 32767;
const KEEP_TOGETHER_CLASS = "keep-together";

export const generateCalculationReportPDF = async (
  project: Project,
  oldProject: Project,
  printUtilsTranslation: Record<string, string> = {},
  classNameTranslation: Record<string, string> = {},
  componentTypeTranslation: Record<string, string> = {},
): Promise<void> => {
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
    span.className =
      !isFirstVersion && prevValue !== currentValue
        ? "project-data highlighted"
        : "project-data";
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

  const { host, root } = createHiddenContainer();
  const doc = document;
  const filename = `${project.projectName}-v${project.version}.pdf`;

  const style = doc.createElement("style");
  style.textContent = `
      th, td {
        border: 1px solid #000;
        padding: 10px;
        text-align: left;
        overflow-wrap: break-word;
        word-break: break-word;
      }
      .project-data {
        font-weight: normal;
      }
      .highlighted {
        color: blue;
        font-weight: bold;
      }
      body { font-family: Arial, sans-serif; padding: 20px; }
      .pdf-container { padding: 20px; background: #ffffff; }
      h1 { text-align: center; }
      .project-info { margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
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
        h3 {
          break-after: avoid;
          page-break-after: avoid;
        }
        .keep-together {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      }
    `;

  const container = doc.createElement("div");
  container.className = "pdf-container";
  container.lang = "fi";

  const heading = createElementWithText(
    doc,
    "h1",
    `${printUtilsTranslation.projectReport}: ${project.projectName}-v${project.version}`,
  );
  // Check language
  const isFinnish =
    printUtilsTranslation.projectReport?.toLowerCase().includes("raportti") ||
    printUtilsTranslation.projectReport?.toLowerCase().includes("projektin");

  // 1. Calculate the total FP score
  const currentTotalFP = calculateTotalPoints(allCurrentComponents);

  // 2. Create Ingress
  const ingressContainer = doc.createElement("div");
  ingressContainer.className = "ingress";
  ingressContainer.style.marginBottom = "20px";

  // 3. Text content
  const ingressLines = isFinnish
    ? [
        `${project.projectName}-järjestelmän toimintoluettelo ja toiminnallinen laajuus lisätiedoilla`,
        dateLocalizer(new Date().toISOString()),
        `Kokonaislaajuus ${currentTotalFP.toFixed(2)} FP`,
        "Laskennassa käytössä FiSMA 1.1 toimintopisteet ISO/IEC 29881:2010",
        "Valmistumisaste on ajankohdan hetkellä olevien toiminnallisuuksien valmistumisaste, ei siis toiminnon määritysten mukaisen lopullisen valmistumisen aste.",
        "Sinisellä värillä korostettu muuttuneet",
      ]
    : [
        `Function list and functional size of the ${project.projectName} system with additional information`,
        dateLocalizer(new Date().toISOString()),
        `Total size ${currentTotalFP.toFixed(2)} FP`,
        "Calculation uses FiSMA 1.1 function points ISO/IEC 29881:2010",
        "The degree of completion reflects the status of functionalities at the current time, not the final completion according to the specifications.",
        "Changed values are highlighted in blue",
      ];

  // 4. Insert into pdf file
  ingressLines.forEach((text) => {
    const p = doc.createElement("p");
    p.textContent = text;
    if (text.includes("Kokonaislaajuus") || text.includes("Total size")) {
      p.style.fontWeight = "bold";
    }
    ingressContainer.appendChild(p);
  });

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
      project.calculationDate ? dateLocalizer(project.calculationDate) : "N/A",
      oldProject.calculationDate
        ? dateLocalizer(oldProject.calculationDate)
        : "N/A",
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

  // --- HELPER FUNCTION: Compare the change ---
  const formatTotalWithDiff = (current: number, previous: number) => {
    if (current === previous) return current.toFixed(2);

    const diff = current - previous;
    const sign = diff > 0 ? "+" : "-";

    return `${current.toFixed(2)} FP (${sign}${diff.toFixed(2)} FP)`;
  };

  const currentTotal = calculateTotalPoints(allCurrentComponents);
  const oldTotal = calculateTotalPoints(allOldComponents);
  const currentPossible = calculateTotalPossiblePoints(allCurrentComponents);
  const oldPossible = calculateTotalPossiblePoints(allOldComponents);

  const currentTotalNoSub = calculateTotalPoints(project.functionalComponents);
  const oldTotalNoSub = calculateTotalPoints(oldProject.functionalComponents);
  const currentPossibleNoSub = calculateTotalPossiblePoints(
    project.functionalComponents,
  );
  const oldPossibleNoSub = calculateTotalPossiblePoints(
    oldProject.functionalComponents,
  );

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
      currentPossible === oldPossible ? currentPossible.toFixed(2) : null,
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
      currentTotalNoSub === oldTotalNoSub ? currentTotalNoSub.toFixed(2) : null,
    ),
  );
  totalRowWithoutSubcomponents.appendChild(
    createComparisonCell(
      doc,
      formatTotalWithDiff(currentPossibleNoSub, oldPossibleNoSub),
      currentPossibleNoSub === oldPossibleNoSub
        ? currentPossibleNoSub.toFixed(2)
        : null,
    ),
  );

  tfoot.appendChild(totalRow);
  tfoot.appendChild(totalRowWithoutSubcomponents);

  table.appendChild(thead);
  table.appendChild(tbody);
  table.appendChild(tfoot);

  // --- HELPER FUNCTION: Summary Table ---
  const createSummaryTable = (
    doc: Document,
    title: string,
    data: (string | number)[][],
    headers: string[],
  ) => {
    const wrapper = doc.createElement("div");
    wrapper.className = KEEP_TOGETHER_CLASS;
    wrapper.style.marginTop = "30px";

    const tableTitle = createElementWithText(doc, "h3", title);
    wrapper.appendChild(tableTitle);

    const tbl = doc.createElement("table");

    // Header
    const tHead = doc.createElement("thead");
    const hRow = doc.createElement("tr");
    headers.forEach((headerText) => {
      hRow.appendChild(createElementWithText(doc, "th", headerText));
    });
    tHead.appendChild(hRow);
    tbl.appendChild(tHead);

    // Body
    const tBody = doc.createElement("tbody");
    data.forEach((rowData) => {
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
  container.appendChild(ingressContainer);
  container.appendChild(projectInfo);
  container.appendChild(table);

  // --- Summary MLA ---
  const actualLayerPoints = calculateProjectPointsByLayer(project);
  const possibleLayerPoints =
    calculatePossiblePointsByLayer(allCurrentComponents);

  const uiLayerLabel = isFinnish
    ? "Käyttöliittymäkerros (UI)"
    : "User Interface Layer (UI)";
  const businessLayerLabel = isFinnish
    ? "Välikerros (Business)"
    : "Business/Middle Layer";
  const dbLayerLabel = isFinnish
    ? "Tietokantakerros (Database)"
    : "Database Layer";

  const mlaData = [
    [
      uiLayerLabel,
      actualLayerPoints.userInterface.toFixed(2),
      possibleLayerPoints.userInterface.toFixed(2),
    ],
    [
      businessLayerLabel,
      actualLayerPoints.business.toFixed(2),
      possibleLayerPoints.business.toFixed(2),
    ],
    [
      dbLayerLabel,
      actualLayerPoints.database.toFixed(2),
      possibleLayerPoints.database.toFixed(2),
    ],
  ];

  const mlaTableHeading = isFinnish
    ? "Monikerrosarkkitehtuurin yhteenveto (MLA Totals)"
    : "Multi-layered Architecture Summary (MLA Totals)";

  const mlaTable = createSummaryTable(doc, mlaTableHeading, mlaData, [
    isFinnish ? "Kerros" : "Layer",
    isFinnish ? "Toteutuneet FP" : "Actual FP",
    isFinnish ? "Maksimaaliset FP (100%)" : "100% FP",
  ]);
  container.appendChild(mlaTable);

  // --- HELPER FUNCTION: Group by Class and Components ---
  const getSummaryDataByProperty = (
    components: ReturnType<typeof getAllComponents>,
    propertyKey: keyof ReturnType<typeof getAllComponents>[number],
    translateFn: (val: string) => string,
  ) => {
    const summary: Record<string, { actual: number; possible: number }> = {};

    components.forEach((comp) => {
      const rawValue = comp[propertyKey];
      if (!rawValue) return;

      const label = translateFn(String(rawValue));

      if (!summary[label]) {
        summary[label] = { actual: 0, possible: 0 };
      }

      const actualPoints = calculateComponentPointsWithMultiplier(
        comp || null,
        comp.degreeOfCompletion,
      );
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
  const classData = getSummaryDataByProperty(
    allCurrentComponents,
    "className",
    translateClassName,
  );

  if (classData.length > 0) {
    const classTableHeading = isFinnish
      ? "Yhteenveto toimintoluokittain (By Class)"
      : "Summary by Component Class";

    const classTable = createSummaryTable(doc, classTableHeading, classData, [
      isFinnish ? "Toimintoluokka" : "Class Name",
      isFinnish ? "Toteutuneet FP" : "Actual FP",
      isFinnish ? "Maksimaaliset FP (100%)" : "100% FP",
    ]);
    container.appendChild(classTable);
  }

  // --- CREATE SUMMARY TABLE GROUP BY TYPE ---
  const typeData = getSummaryDataByProperty(
    allCurrentComponents,
    "componentType",
    translateComponentType,
  );

  if (typeData.length > 0) {
    const typeTableHeading = isFinnish
      ? "Yhteenveto toimintotyypeittäin (By Type)"
      : "Summary by Component Type";

    const typeTable = createSummaryTable(doc, typeTableHeading, typeData, [
      isFinnish ? "Toimintotyyppi" : "Component Type",
      isFinnish ? "Toteutuneet FP" : "Actual FP",
      isFinnish ? "Maksimaaliset FP (100%)" : "100% FP",
    ]);
    container.appendChild(typeTable);
  }

  root.appendChild(style);
  root.appendChild(container);
  try {
    await waitForContentReady();
    await downloadElementsAsPdf([container], filename);
  } finally {
    host.remove();
  }
};
