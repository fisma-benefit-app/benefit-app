import { Project, TGenericComponent } from "./types";
import {
  calculateBasePoints,
  calculateComponentPoints,
  calculateGrandTotalPoints,
  calculateGrandTotalPossiblePoints,
  getGroupedComponents,
  calculateMLALayerDetails,
  calculateMLAMessageCounts,
  calculateExternalInterfaceDetails,
} from "./centralizedCalculations";
import { downloadPdfmakeDocument } from "./pdf/pdfmakeRuntime";
import {
  ARCHITECTURE_DIAGRAM_WIDTH,
  createArchitectureDiagram,
} from "./pdf/architectureDiagram";
import {
  PDF_COLORS,
  createReportDocument,
  mmToPt,
  reportTable,
  spanningCell,
  textCell,
} from "./pdf/pdfReportLayout";
import type { CellOptions } from "./pdf/pdfReportLayout";
import type { Content, TableCell } from "pdfmake/interfaces";

const INCOMING_INTERFACE_CLASS = "Interface service from other applications";
const OUTGOING_INTERFACE_CLASS = "Interface service to other applications";

const PAGE_MARGIN_PT = mmToPt(12);
const A4_PORTRAIT_WIDTH_PT = 595.28;
const A4_PORTRAIT_HEIGHT_PT = 841.89;
const CONTENT_WIDTH_PT = A4_PORTRAIT_WIDTH_PT - 2 * PAGE_MARGIN_PT;

type PointsPart = string | { text: string; color: string; bold: boolean };

export const generateOverviewPDF = async (
  project: Project,
  previousProject?: Project,
  language: "fi" | "en" = "fi",
  classNameTranslation: Record<string, string> = {},
  componentTypeTranslation: Record<string, string> = {},
  includeFunctions = false,
): Promise<void> => {
  const labels =
    language === "fi"
      ? {
          calculation: "Toiminnallisen koon laskenta",
          total: "Kokonaislaajuus",
          uiLayer: "Käyttöliittymäkerros",
          businessLayer: "Välikerros",
          databaseLayer: "Tietovarastokerros",
          externalLayer: "Ulkoiset sovellukset",
          interfaces: "liittymää",
          functions: "toimintoa",
          concepts: "käsitettä",
          functionClass: "Toimintoluokka",
          actionPoints: "Toimintopisteet",
          percentDone: "Valmis %",
          aggregates: "Koosteet ja tärkeät muutokset",
          classAggregate: "Toimintoluokat",
          count: "Määrä",
          sum: "Yhteensä",
          subComponents: "MLA-alikomponentit",
          functionList: "Toimintolista",
          functionName: "Toiminto",
          functionType: "Toimintotyyppi",
          functionListNote:
            "MLA-alikomponentit on listattu vanhempansa alla. Pisteet ovat tehdyt / mahdolliset pisteet.",
          unspecified: "Ei valittu",
          inCount: "Saapuvat",
          outCount: "Lähtevät",
          interfaceSummary: "Liittymät",
          interface: "Liittymä",
          explanation: "Laskennan selitys ja tärkeät muutokset",
          changed:
            "Muuttuneet arvot on korostettu. Suluissa oleva luku kertoo eron edelliseen versioon.",
          sizeOverview: "toiminnallisen laajuuden yhteenveto",
          methodFooter:
            "FiSMA 1.1 Toiminnallisen koon mittaamisen menetelmä ISO/IEC 29881:2010",
          in: "sisään",
          out: "ulos",
          pointUnit: "TP",
        }
      : {
          calculation: "Functional size calculation",
          total: "Total size",
          uiLayer: "User interface layer",
          businessLayer: "Business layer",
          databaseLayer: "Data storage layer",
          externalLayer: "External applications",
          interfaces: "interfaces",
          functions: "functions",
          concepts: "concepts",
          functionClass: "Function class",
          actionPoints: "Action points",
          percentDone: "% done",
          aggregates: "Aggregates and important changes",
          classAggregate: "Function classes",
          count: "Count",
          sum: "Total",
          subComponents: "MLA subcomponents",
          functionList: "Function list",
          functionName: "Function",
          functionType: "Function type",
          functionListNote:
            "MLA subcomponents are listed under their parent. Points are done / possible points.",
          unspecified: "Not selected",
          inCount: "Incoming",
          outCount: "Outgoing",
          interfaceSummary: "Interfaces",
          interface: "Interface",
          explanation: "Calculation explanation and important changes",
          changed:
            "Changed values are highlighted. The number in parentheses shows the difference from the previous version.",
          sizeOverview: "functional size overview",
          methodFooter:
            "FiSMA 1.1 Toiminnallisen koon mittaamisen menetelmä ISO/IEC 29881:2010",
          in: "in",
          out: "out",
          pointUnit: "FP",
        };

  const formatNumber = (value: number) => value.toFixed(2);
  // Difference to the previous version, shown in green; undefined when there is nothing to show.
  const deltaPart = (
    current: number,
    previous?: number,
  ): PointsPart | undefined => {
    if (previous === undefined) return undefined;
    const difference = current - previous;
    // Ignore floating point noise that would otherwise be shown as "+0.00"
    if (Math.abs(difference) < 0.005) return undefined;
    return {
      text: ` (${difference >= 0 ? "+" : ""}${formatNumber(difference)})`,
      color: PDF_COLORS.deltaGreen,
      bold: true,
    };
  };
  const pointsParts = (
    points: number,
    possiblePoints: number,
    previousPoints?: number,
  ): PointsPart[] => {
    const delta = deltaPart(points, previousPoints);
    return [
      formatNumber(points),
      ...(delta ? [delta] : []),
      ` / ${formatNumber(possiblePoints)}`,
    ];
  };
  const pointsCell = (
    points: number,
    possiblePoints: number,
    previousPoints?: number,
    options?: CellOptions,
  ): TableCell => ({
    text: pointsParts(points, possiblePoints, previousPoints),
    ...options,
  });
  const percentDone = (done: number, possible: number) =>
    possible > 0 ? `${((done / possible) * 100).toFixed(0)} %` : "–";

  const totalPoints = calculateGrandTotalPoints(project.functionalComponents);
  const totalPossiblePoints = calculateGrandTotalPossiblePoints(
    project.functionalComponents,
  );
  const previousTotalPoints = previousProject
    ? calculateGrandTotalPoints(previousProject.functionalComponents)
    : undefined;

  type SummaryRow = {
    name: string;
    count: number;
    points: number;
    possiblePoints: number;
  };
  type Groups = ReturnType<typeof getGroupedComponents>["parentGroups"];

  // Turns the app's grouped components (getGroupedComponents) into rows of the class table
  const summaryRows = (groups: Groups): SummaryRow[] =>
    groups.map((group) => ({
      name: group.className
        ? classNameTranslation[group.className] || group.className
        : labels.unspecified,
      count: group.components.reduce((sum, entry) => sum + entry.count, 0),
      points: group.components.reduce((sum, entry) => sum + entry.points, 0),
      possiblePoints: group.components.reduce(
        (sum, entry) => sum + entry.possiblePoints,
        0,
      ),
    }));

  const summaryTableRow = (
    name: string,
    current: Omit<SummaryRow, "name">,
    previousPoints?: number,
    options?: CellOptions,
  ): TableCell[] => [
    textCell(name, options),
    textCell(current.count, options),
    pointsCell(current.points, current.possiblePoints, previousPoints, options),
    textCell(percentDone(current.points, current.possiblePoints), options),
  ];

  // Same layout and order as the project summary in the app (FunctionalPointSummary): classes in
  // the order they first appear in the component list, parent components first, then the generated
  // MLA subcomponents, so the total row adds up to the total size.
  const groupedRows = (): TableCell[][] => {
    const inListOrder = (target: Project) =>
      [...target.functionalComponents].sort(
        (a, b) => a.orderPosition - b.orderPosition,
      );
    const current = getGroupedComponents(inListOrder(project));
    const previous = previousProject
      ? getGroupedComponents(inListOrder(previousProject))
      : undefined;
    const section = (groups: Groups, previousGroups?: Groups) => {
      const rows = summaryRows(groups);
      const previousRows = previousGroups
        ? summaryRows(previousGroups)
        : undefined;
      return rows.map((row) =>
        summaryTableRow(
          row.name,
          row,
          previousRows
            ? previousRows.find((entry) => entry.name === row.name)?.points || 0
            : undefined,
        ),
      );
    };
    const parentRows = section(current.parentGroups, previous?.parentGroups);
    const subRows = section(
      current.subComponentGroups,
      previous?.subComponentGroups,
    );
    const allRows = summaryRows([
      ...current.parentGroups,
      ...current.subComponentGroups,
    ]);
    const totals = {
      count: allRows.reduce((sum, row) => sum + row.count, 0),
      points: totalPoints,
      possiblePoints: totalPossiblePoints,
    };
    return [
      ...parentRows,
      ...(subRows.length > 0
        ? [
            spanningCell(labels.subComponents, 4, {
              bold: true,
              fillColor: PDF_COLORS.subHeadingFill,
            }),
            ...subRows,
          ]
        : []),
      summaryTableRow(labels.sum, totals, previousTotalPoints, {
        bold: true,
        fillColor: PDF_COLORS.tableHeaderFill,
      }),
    ];
  };

  // Incoming and outgoing interfaces: standalone interface components plus the generated message subcomponents
  const interfaceTotals = (target: Project) => {
    const { parentGroups, subComponentGroups } = getGroupedComponents(
      target.functionalComponents,
    );
    const totalsFor = (className: string) =>
      [...parentGroups, ...subComponentGroups]
        .filter((group) => group.className === className)
        .flatMap((group) => group.components)
        .reduce(
          (sum, entry) => ({
            count: sum.count + entry.count,
            points: sum.points + entry.points,
            possiblePoints: sum.possiblePoints + entry.possiblePoints,
          }),
          { count: 0, points: 0, possiblePoints: 0 },
        );
    return {
      incoming: totalsFor(INCOMING_INTERFACE_CLASS),
      outgoing: totalsFor(OUTGOING_INTERFACE_CLASS),
    };
  };
  const currentInterfaces = interfaceTotals(project);
  const previousInterfaces = previousProject
    ? interfaceTotals(previousProject)
    : undefined;
  const interfaceRow = (
    label: string,
    current: Omit<SummaryRow, "name">,
    previous?: { points: number },
  ) => summaryTableRow(label, current, previous?.points);

  // Optional per-function listing; MLA subcomponents follow their parent so the rows add up to the
  // total size. Previous-version values are matched through previousFCId.
  const functionListContent = (): Content[] => {
    const previousPoints = new Map<number, number>();
    previousProject?.functionalComponents.forEach((component) => {
      previousPoints.set(component.id, calculateComponentPoints(component));
      component.subComponents?.forEach((sub) =>
        previousPoints.set(
          sub.id,
          calculateComponentPoints(sub as TGenericComponent),
        ),
      );
    });
    const row = (component: TGenericComponent, isSub: boolean): TableCell[] => {
      const points = calculateComponentPoints(component);
      const possible = calculateBasePoints(component);
      const previous = previousProject
        ? (previousPoints.get(component.previousFCId ?? -1) ?? 0)
        : undefined;
      const fill = isSub ? { fillColor: PDF_COLORS.subRowFill } : undefined;
      return [
        textCell(
          component.title || "–",
          isSub ? { ...fill, indent: 10 } : fill,
        ),
        textCell(
          component.className
            ? classNameTranslation[component.className] || component.className
            : labels.unspecified,
          fill,
        ),
        textCell(
          component.componentType
            ? componentTypeTranslation[component.componentType] ||
                component.componentType
            : labels.unspecified,
          fill,
        ),
        pointsCell(points, possible, previous, fill),
        textCell(percentDone(points, possible), fill),
      ];
    };
    const rows = [...project.functionalComponents]
      .sort((a, b) => a.orderPosition - b.orderPosition)
      .flatMap((component) => [
        row(component, false),
        ...(component.subComponents ?? []).map((sub) =>
          row(sub as TGenericComponent, true),
        ),
      ]);
    const totalOptions = {
      bold: true,
      fillColor: PDF_COLORS.tableHeaderFill,
    };
    return [
      sectionHeading(labels.functionList),
      { text: labels.functionListNote, style: "small" },
      reportTable({
        headers: [
          labels.functionName,
          labels.functionClass,
          labels.functionType,
          labels.actionPoints,
          labels.percentDone,
        ],
        rows: [
          ...rows,
          [
            ...spanningCell(labels.sum, 3, totalOptions),
            pointsCell(
              totalPoints,
              totalPossiblePoints,
              previousTotalPoints,
              totalOptions,
            ),
            textCell(
              percentDone(totalPoints, totalPossiblePoints),
              totalOptions,
            ),
          ],
        ],
        widths: ["*", 115, 90, 112, 45],
      }),
    ];
  };

  // Section title with a rule under it; every section starts on its own page.
  const sectionHeading = (text: string): Content => ({
    stack: [
      { text, style: "h2", pageBreak: "before", margin: [0, 0, 0, 4] },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: CONTENT_WIDTH_PT,
            y2: 0,
            lineWidth: 1.5,
            lineColor: PDF_COLORS.heading,
          },
        ],
        margin: [0, 0, 0, 6],
      },
    ],
  });

  // A bordered, always-visible box (contact details, notes), keeping the text's own line breaks.
  const textBox = (text: string | null | undefined, minHeightMm: number) =>
    ({
      table: {
        widths: ["*"],
        heights: [mmToPt(minHeightMm)],
        body: [
          [
            {
              text: text ?? "",
              margin: [mmToPt(3), mmToPt(3), mmToPt(3), mmToPt(3)],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => PDF_COLORS.border,
        vLineColor: () => PDF_COLORS.border,
      },
      margin: [0, 4, 0, 0],
    }) as Content;

  const layers = calculateMLALayerDetails(project.functionalComponents);
  const messages = calculateMLAMessageCounts(project.functionalComponents);
  const externalInterfaces = calculateExternalInterfaceDetails(
    project.functionalComponents,
  );
  const externalInterfacePoints =
    externalInterfaces.toOtherApplications.points +
    externalInterfaces.fromOtherApplications.points;
  const externalInterfaceCount =
    externalInterfaces.toOtherApplications.count +
    externalInterfaces.fromOtherApplications.count;
  const businessOnlyPoints = layers.business.points - externalInterfacePoints;
  const reportDate = project.calculationDate
    ? project.calculationDate.split("-").reverse().join(".")
    : "";
  const pointUnit = labels.pointUnit;
  const year = project.calculationDate?.slice(0, 4) || new Date().getFullYear();
  const filename = `${project.projectName}-Toiminnallisen-laajuuden-yhteenveto-${project.version}-${year}.pdf`;
  const title = `${project.projectName} - ${labels.sizeOverview}`;

  const coverPage: Content[] = [
    { text: title, fontSize: 22, bold: true, margin: [0, 0, 0, 14] },
    { text: reportDate, fontSize: 16, margin: [0, 0, 0, 24] },
    textBox(project.reportContactDetails, 25),
    // Pinned to the bottom of the first page, like the old cover footer.
    {
      absolutePosition: {
        x: PAGE_MARGIN_PT,
        y: A4_PORTRAIT_HEIGHT_PT - PAGE_MARGIN_PT - mmToPt(26),
      },
      table: {
        widths: [CONTENT_WIDTH_PT],
        body: [
          [
            {
              text: labels.methodFooter,
              fontSize: 9,
              margin: [mmToPt(4), mmToPt(4), mmToPt(4), mmToPt(4)],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.75,
        vLineWidth: () => 0.75,
        hLineColor: () => "#333333",
        vLineColor: () => "#333333",
      },
    },
  ];

  const connectorTexts = (count: number, direction: "in" | "out") =>
    `${count} ${labels.interfaces} ${labels[direction]}`;

  const calculationPage: Content[] = [
    sectionHeading(labels.calculation),
    {
      text: [
        `${labels.total} `,
        ...pointsParts(totalPoints, totalPossiblePoints, previousTotalPoints),
        ` ${pointUnit} – ${percentDone(totalPoints, totalPossiblePoints)}`,
      ],
      fontSize: 11,
      bold: true,
      margin: [0, 0, 0, 10],
    },
    createArchitectureDiagram(
      {
        ui: {
          title: labels.uiLayer,
          points: `${layers.ui.points.toFixed(2)} ${pointUnit}`,
          detail: `${layers.ui.count} ${labels.functions}`,
        },
        business: {
          title: labels.businessLayer,
          points: `${businessOnlyPoints.toFixed(2)} ${pointUnit}`,
          detail:
            language === "fi"
              ? "Algoritmiset toiminnot"
              : "Algorithmic activities",
        },
        database: {
          title: labels.databaseLayer,
          points: `${layers.database.points.toFixed(2)} ${pointUnit}`,
          detail: `${layers.database.count} ${labels.concepts}`,
        },
        external: {
          title: labels.externalLayer,
          points: `${externalInterfacePoints.toFixed(2)} ${pointUnit}`,
          detail: `${externalInterfaceCount} ${labels.interfaces}`,
        },
        uiBusiness: [
          { arrow: "↓", text: connectorTexts(messages.uiToBusiness, "in") },
          { arrow: "↑", text: connectorTexts(messages.businessToUi, "out") },
        ],
        businessDatabase: [
          {
            arrow: "↓",
            text: connectorTexts(messages.businessToDatabase, "out"),
          },
          {
            arrow: "↑",
            text: connectorTexts(messages.databaseToBusiness, "in"),
          },
        ],
        businessExternal: [
          {
            arrow: "→",
            text: `${externalInterfaces.toOtherApplications.count} ${labels.out}`,
          },
          {
            arrow: "←",
            text: `${externalInterfaces.fromOtherApplications.count} ${labels.in}`,
          },
        ],
      },
      [(CONTENT_WIDTH_PT - ARCHITECTURE_DIAGRAM_WIDTH) / 2, 4, 0, 0],
    ),
  ];

  const aggregatePage: Content[] = [
    sectionHeading(labels.aggregates),
    { text: labels.classAggregate, style: "h3" },
    reportTable({
      headers: [
        labels.functionClass,
        labels.count,
        labels.actionPoints,
        labels.percentDone,
      ],
      rows: groupedRows(),
      widths: ["*", 50, 130, 60],
    }),
    { text: labels.interfaceSummary, style: "h3" },
    reportTable({
      headers: [
        labels.interface,
        labels.count,
        labels.actionPoints,
        labels.percentDone,
      ],
      rows: [
        interfaceRow(
          labels.inCount,
          currentInterfaces.incoming,
          previousInterfaces?.incoming,
        ),
        interfaceRow(
          labels.outCount,
          currentInterfaces.outgoing,
          previousInterfaces?.outgoing,
        ),
      ],
      widths: ["*", 50, 130, 60],
    }),
    { text: labels.explanation, style: "h3" },
    textBox(project.reportNotes, 25),
    { text: labels.changed, style: "small", margin: [0, 6, 0, 0] },
  ];

  await downloadPdfmakeDocument(
    createReportDocument({
      title: filename,
      pageMargins: [
        PAGE_MARGIN_PT,
        PAGE_MARGIN_PT,
        PAGE_MARGIN_PT,
        PAGE_MARGIN_PT + mmToPt(2),
      ],
      content: [
        ...coverPage,
        ...calculationPage,
        ...aggregatePage,
        ...(includeFunctions ? functionListContent() : []),
      ],
    }),
    filename,
  );
};
