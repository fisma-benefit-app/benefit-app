import { Project, TGenericComponent } from "./types";
import {
  calculateComponentPointsWithMultiplier,
  calculateTotalPoints,
  calculateTotalPossiblePoints,
  calculateBasePoints,
  calculateProjectPointsByLayer,
  calculatePossiblePointsByLayer,
} from "./centralizedCalculations";
import { dateLocalizer, getAllComponents } from "./printUtils";
import { downloadPdfmakeDocument } from "./pdf/pdfmakeRuntime";
import {
  PDF_COLORS,
  changedCell,
  createReportDocument,
  keepTogether,
  reportTable,
  spanningCell,
  textCell,
} from "./pdf/pdfReportLayout";
import type { Content, TableCell } from "pdfmake/interfaces";

type CellValue = string | number | null | undefined;

// Total columns in the main component table; the total rows' label spans all but the last two.
const COMPONENT_COLUMN_COUNT = 10;

// Fixed widths (pt) for everything but the title, which takes the remaining space. The wide
// table is why this report is landscape.
const COMPONENT_TABLE_WIDTHS = ["*", 110, 90, 50, 52, 54, 52, 72, 52, 52];

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

  const isChanged = (current: CellValue, prev: CellValue) =>
    !isFirstVersion && prev !== current;

  // A value that differs from the previous version is shown in bold blue.
  const comparisonCell = (
    current: CellValue,
    prev: CellValue,
    options?: Parameters<typeof textCell>[1],
  ) =>
    changedCell(
      current,
      isChanged(current, prev),
      PDF_COLORS.changedBlue,
      options,
    );

  const comparisonText = (current: CellValue, prev: CellValue) => ({
    text: current == null ? "" : String(current),
    ...(isChanged(current, prev)
      ? { color: PDF_COLORS.changedBlue, bold: true }
      : {}),
  });

  const translateClassName = (className: string) =>
    classNameTranslation[className] || className;

  const translateComponentType = (componentType?: string | null) =>
    componentType
      ? componentTypeTranslation[componentType] || componentType
      : "";

  const filename = `${project.projectName}-v${project.version}.pdf`;

  const headingText = `${printUtilsTranslation.projectReport}: ${project.projectName}-v${project.version}`;
  // Check language
  const isFinnish =
    printUtilsTranslation.projectReport?.toLowerCase().includes("raportti") ||
    printUtilsTranslation.projectReport?.toLowerCase().includes("projektin");

  // 1. Calculate the total FP score
  const currentTotalFP = calculateTotalPoints(allCurrentComponents);

  // 2. Text content
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

  const ingress: Content[] = ingressLines.map((text) => ({
    text,
    bold: text.includes("Kokonaislaajuus") || text.includes("Total size"),
    margin: [0, 0, 0, 3],
  }));

  const infoRows: [string, CellValue, CellValue][] = [
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

  const projectInfo: Content[] = infoRows.map(
    ([label, currentValue, prevValue]) => ({
      text: [
        { text: `${label}: `, bold: true },
        comparisonText(currentValue, prevValue),
      ],
      margin: [0, 0, 0, 3],
    }),
  );

  // One table row for a component and (when it has a counterpart in the previous version) its
  // previous values. Subcomponent rows get an indented title and a light fill.
  const buildComponentRow = (
    comp: TGenericComponent,
    prevComp: TGenericComponent | null,
    isSubComponent: boolean,
  ): TableCell[] => {
    const fill = isSubComponent
      ? { fillColor: PDF_COLORS.subRowFill }
      : undefined;
    const titleOptions = isSubComponent ? { ...fill, indent: 10 } : undefined;

    return [
      comparisonCell(comp.title, prevComp?.title ?? null, titleOptions),
      comparisonCell(
        translateClassName(comp.className),
        prevComp ? translateClassName(prevComp.className) : null,
        fill,
      ),
      comparisonCell(
        translateComponentType(comp.componentType),
        prevComp ? translateComponentType(prevComp.componentType) : null,
        fill,
      ),
      comparisonCell(comp.dataElements, prevComp?.dataElements ?? null, fill),
      comparisonCell(
        comp.readingReferences,
        prevComp?.readingReferences ?? null,
        fill,
      ),
      comparisonCell(
        comp.writingReferences,
        prevComp?.writingReferences ?? null,
        fill,
      ),
      comparisonCell(comp.operations, prevComp?.operations ?? null, fill),
      comparisonCell(
        comp.degreeOfCompletion,
        prevComp?.degreeOfCompletion ?? null,
        fill,
      ),
      comparisonCell(
        calculateComponentPointsWithMultiplier(
          comp,
          comp.degreeOfCompletion,
        ).toFixed(2),
        calculateComponentPointsWithMultiplier(
          prevComp,
          prevComp?.degreeOfCompletion || null,
        ).toFixed(2),
        fill,
      ),
      comparisonCell(
        calculateBasePoints(comp).toFixed(2),
        prevComp ? calculateBasePoints(prevComp).toFixed(2) : "0.00",
        fill,
      ),
    ];
  };

  const componentRows: TableCell[][] = [];
  project.functionalComponents.forEach((comp) => {
    const prevComp = comp.previousFCId
      ? previousComponentsMap[comp.previousFCId]
      : null;
    componentRows.push(buildComponentRow(comp, prevComp, false));

    comp.subComponents?.forEach((sub) => {
      const prevSub = sub.previousFCId
        ? previousComponentsMap[sub.previousFCId]
        : null;
      componentRows.push(buildComponentRow(sub, prevSub, true));
    });
  });

  // --- HELPER FUNCTION: Compare the change ---
  const formatTotalWithDiff = (current: number, previous: number) => {
    if (current === previous) return current.toFixed(2);

    const diff = current - previous;
    const sign = diff > 0 ? "+" : "-";

    return `${current.toFixed(2)} FP (${sign}${diff.toFixed(2)} FP)`;
  };

  const totalCell = (current: number, previous: number) =>
    changedCell(
      formatTotalWithDiff(current, previous),
      !isFirstVersion && current !== previous,
      PDF_COLORS.changedBlue,
      { bold: true, fillColor: PDF_COLORS.tableHeaderFill },
    );

  const totalRow = (
    label: string,
    current: { actual: number; possible: number },
    previous: { actual: number; possible: number },
  ): TableCell[] => [
    ...spanningCell(label, COMPONENT_COLUMN_COUNT - 2, {
      bold: true,
      fillColor: PDF_COLORS.tableHeaderFill,
    }),
    totalCell(current.actual, previous.actual),
    totalCell(current.possible, previous.possible),
  ];

  componentRows.push(
    totalRow(
      printUtilsTranslation.totalFunctionalPoints,
      {
        actual: calculateTotalPoints(allCurrentComponents),
        possible: calculateTotalPossiblePoints(allCurrentComponents),
      },
      {
        actual: calculateTotalPoints(allOldComponents),
        possible: calculateTotalPossiblePoints(allOldComponents),
      },
    ),
    totalRow(
      printUtilsTranslation.totalFunctionalPointsWithoutSubcomponents,
      {
        actual: calculateTotalPoints(project.functionalComponents),
        possible: calculateTotalPossiblePoints(project.functionalComponents),
      },
      {
        actual: calculateTotalPoints(oldProject.functionalComponents),
        possible: calculateTotalPossiblePoints(oldProject.functionalComponents),
      },
    ),
  );

  const componentTable = reportTable({
    headers: [
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
    ],
    rows: componentRows,
    widths: COMPONENT_TABLE_WIDTHS,
    margin: [0, 10, 0, 0],
  });

  // --- HELPER FUNCTION: Summary Table ---
  const createSummaryTable = (
    title: string,
    data: string[][],
    headers: string[],
  ): Content =>
    keepTogether(
      { text: title, style: "h3", margin: [0, 20, 0, 4] },
      reportTable({
        headers,
        rows: data.map((rowData) => rowData.map((cell) => textCell(cell))),
        widths: ["*", 110, 130],
        margin: [0, 4, 0, 0],
      }),
    );

  const summaryTables: Content[] = [];

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

  summaryTables.push(
    createSummaryTable(mlaTableHeading, mlaData, [
      isFinnish ? "Kerros" : "Layer",
      isFinnish ? "Toteutuneet FP" : "Actual FP",
      isFinnish ? "Maksimaaliset FP (100%)" : "100% FP",
    ]),
  );

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

    summaryTables.push(
      createSummaryTable(classTableHeading, classData, [
        isFinnish ? "Toimintoluokka" : "Class Name",
        isFinnish ? "Toteutuneet FP" : "Actual FP",
        isFinnish ? "Maksimaaliset FP (100%)" : "100% FP",
      ]),
    );
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

    summaryTables.push(
      createSummaryTable(typeTableHeading, typeData, [
        isFinnish ? "Toimintotyyppi" : "Component Type",
        isFinnish ? "Toteutuneet FP" : "Actual FP",
        isFinnish ? "Maksimaaliset FP (100%)" : "100% FP",
      ]),
    );
  }

  await downloadPdfmakeDocument(
    createReportDocument({
      title: headingText,
      pageOrientation: "landscape",
      content: [
        { text: headingText, style: "h1", alignment: "center" },
        { stack: ingress, margin: [0, 0, 0, 10] },
        { stack: projectInfo, margin: [0, 0, 0, 10] },
        componentTable,
        ...summaryTables,
      ],
    }),
    filename,
  );
};
