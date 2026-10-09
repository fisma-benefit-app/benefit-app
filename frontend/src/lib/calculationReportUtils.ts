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
  mmToPt,
  reportTable,
  reportTableLayout,
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

// Columns from Data Elements onwards hold numbers and are right-aligned
const FIRST_NUMBER_COLUMN = 3;

// Sub-component classes, used to tint sub-component rows by direction
const SENT_CLASS_NAME = "Interface service to other applications";
const RECEIVED_CLASS_NAME = "Interface service from other applications";

// Landscape A4 width minus createReportDocument's default 10 mm side margins, for full-width rules
const CONTENT_WIDTH_PT = mmToPt(297) - 2 * mmToPt(10);

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
  const texts = isFinnish
    ? {
        subtitle: `${project.projectName}-järjestelmän toimintoluettelo ja toiminnallinen laajuus lisätiedoilla`,
        totalSize: "Kokonaislaajuus",
        reportDate: "Raportti luotu",
        method: "Laskentamenetelmä",
        methodValue: "FiSMA 1.1 toimintopisteet",
        methodStandard: "ISO/IEC 29881:2010",
        projectDetails: "Projektin tiedot",
        functionList: "Toimintoluettelo",
        summaries: "Yhteenvedot",
        completionNote:
          "Valmistumisaste on ajankohdan hetkellä olevien toiminnallisuuksien valmistumisaste, ei siis toiminnon määritysten mukaisen lopullisen valmistumisen aste.",
        changedNote: "Sinisellä värillä korostettu muuttuneet",
        rowColours: "Alikomponenttien rivivärit",
      }
    : {
        subtitle: `Function list and functional size of the ${project.projectName} system with additional information`,
        totalSize: "Total size",
        reportDate: "Report created",
        method: "Calculation method",
        methodValue: "FiSMA 1.1 function points",
        methodStandard: "ISO/IEC 29881:2010",
        projectDetails: "Project details",
        functionList: "Function list",
        summaries: "Summaries",
        completionNote:
          "The degree of completion reflects the status of functionalities at the current time, not the final completion according to the specifications.",
        changedNote: "Changed values are highlighted in blue",
        rowColours: "Sub-component row colours",
      };

  // Section title with a rule under it, same look as the overview report's section headings
  const sectionHeading = (text: string, marginTop = 14): Content => ({
    stack: [
      { text, style: "h2", margin: [0, marginTop, 0, 4] },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: CONTENT_WIDTH_PT,
            y2: 0,
            lineWidth: 1,
            lineColor: PDF_COLORS.heading,
          },
        ],
        margin: [0, 0, 0, 8],
      },
    ],
  });

  const titleBlock: Content = {
    stack: [
      { text: headingText, style: "h1", margin: [0, 0, 0, 2] },
      { text: texts.subtitle, fontSize: 10, color: PDF_COLORS.mutedText },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: CONTENT_WIDTH_PT,
            y2: 0,
            lineWidth: 2,
            lineColor: PDF_COLORS.heading,
          },
        ],
        margin: [0, 8, 0, 12],
      },
    ],
  };

  // A shaded box with a small label above a large value, for the key figures under the title.
  // Every box has a detail line (blank if not given) so all boxes are the same height.
  const keyFigure = (label: string, value: string, detail = " "): Content => ({
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              { text: label, fontSize: 8, color: PDF_COLORS.mutedText },
              {
                text: value,
                fontSize: 14,
                bold: true,
                color: PDF_COLORS.heading,
                margin: [0, 2, 0, 1],
              },
              { text: detail, fontSize: 8, color: PDF_COLORS.mutedText },
            ],
            fillColor: PDF_COLORS.subHeadingFill,
            margin: [8, 6, 8, 6],
          },
        ],
      ],
    },
    layout: "noBorders",
  });

  const keyFigures: Content = {
    columns: [
      keyFigure(texts.totalSize, `${currentTotalFP.toFixed(2)} FP`),
      keyFigure(texts.reportDate, dateLocalizer(new Date().toISOString())),
      keyFigure(texts.method, texts.methodValue, texts.methodStandard),
    ],
    columnGap: 10,
  };

  // Explains the degree of completion, the blue highlighting and the sub-component row colours,
  // shown right above the function list
  const notes: Content = {
    stack: [
      { text: texts.completionNote },
      {
        text: texts.changedNote,
        color: PDF_COLORS.changedBlue,
        bold: true,
        margin: [0, 2, 0, 0],
      },
      {
        text: [
          `${texts.rowColours}:  `,
          {
            text: ` ${translateClassName(SENT_CLASS_NAME)} `,
            background: PDF_COLORS.sentFill,
            color: PDF_COLORS.text,
          },
          "   ",
          {
            text: ` ${translateClassName(RECEIVED_CLASS_NAME)} `,
            background: PDF_COLORS.receivedFill,
            color: PDF_COLORS.text,
          },
        ],
        margin: [0, 3, 0, 0],
      },
    ],
    fontSize: 8,
    color: PDF_COLORS.mutedText,
  };

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

  // Project details as a label/value table, two pairs per row
  const projectInfoRows: TableCell[][] = [];
  for (let i = 0; i < infoRows.length; i += 2) {
    projectInfoRows.push(
      infoRows
        .slice(i, i + 2)
        .flatMap(([label, currentValue, prevValue]) => [
          textCell(label, { bold: true, fillColor: PDF_COLORS.subHeadingFill }),
          comparisonCell(currentValue, prevValue),
        ]),
    );
  }

  const projectInfo: Content = {
    table: { widths: [130, "*", 130, "*"], body: projectInfoRows },
    layout: reportTableLayout,
  };

  // One table row for a component and (when it has a counterpart in the previous version) its
  // previous values. Main component titles are bold; subcomponent rows get an indented title and
  // a fill showing their direction (green "to", orange "from" other applications).
  const buildComponentRow = (
    comp: TGenericComponent,
    prevComp: TGenericComponent | null,
    isSubComponent: boolean,
  ): TableCell[] => {
    const subRowFill =
      comp.className === SENT_CLASS_NAME
        ? PDF_COLORS.sentFill
        : comp.className === RECEIVED_CLASS_NAME
          ? PDF_COLORS.receivedFill
          : PDF_COLORS.subRowFill;
    const fill = isSubComponent ? { fillColor: subRowFill } : undefined;
    const titleOptions = isSubComponent
      ? { ...fill, indent: 10 }
      : { bold: true };
    const numberOptions = { ...fill, alignment: "right" as const };

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
      comparisonCell(
        comp.dataElements,
        prevComp?.dataElements ?? null,
        numberOptions,
      ),
      comparisonCell(
        comp.readingReferences,
        prevComp?.readingReferences ?? null,
        numberOptions,
      ),
      comparisonCell(
        comp.writingReferences,
        prevComp?.writingReferences ?? null,
        numberOptions,
      ),
      comparisonCell(
        comp.operations,
        prevComp?.operations ?? null,
        numberOptions,
      ),
      comparisonCell(
        comp.degreeOfCompletion,
        prevComp?.degreeOfCompletion ?? null,
        numberOptions,
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
        numberOptions,
      ),
      comparisonCell(
        calculateBasePoints(comp).toFixed(2),
        prevComp ? calculateBasePoints(prevComp).toFixed(2) : "0.00",
        numberOptions,
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
      { bold: true, fillColor: PDF_COLORS.tableHeaderFill, alignment: "right" },
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
    margin: [0, 8, 0, 0],
    headerAlignments: Array.from({ length: COMPONENT_COLUMN_COUNT }, (_, i) =>
      i >= FIRST_NUMBER_COLUMN ? "right" : "left",
    ),
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
        // First column is the label, the other two are numbers
        rows: data.map((rowData) =>
          rowData.map((cell, index) =>
            textCell(cell, index > 0 ? { alignment: "right" } : undefined),
          ),
        ),
        widths: ["*", 110, 130],
        margin: [0, 4, 0, 0],
        headerAlignments: ["left", "right", "right"],
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

  // The "Summaries" heading is kept on the same page as the first summary table
  const [firstSummaryTable, ...otherSummaryTables] = summaryTables;

  await downloadPdfmakeDocument(
    createReportDocument({
      title: headingText,
      pageOrientation: "landscape",
      content: [
        titleBlock,
        keyFigures,
        sectionHeading(texts.projectDetails, 16),
        projectInfo,
        sectionHeading(texts.functionList, 18),
        notes,
        componentTable,
        keepTogether(sectionHeading(texts.summaries, 22), firstSummaryTable),
        ...otherSummaryTables,
      ],
    }),
    filename,
  );
};
