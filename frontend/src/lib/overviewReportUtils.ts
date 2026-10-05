import { Project } from "./types";
import {
  calculateGrandTotalPoints,
  calculateGrandTotalPossiblePoints,
  getGroupedComponents,
  calculateMLALayerDetails,
  calculateMLAMessageCounts,
  calculateExternalInterfaceDetails,
} from "./centralizedCalculations";
import { downloadHtmlAsPdf, escapeHtmlForSummary } from "./printUtils";

const INCOMING_INTERFACE_CLASS = "Interface service from other applications";
const OUTGOING_INTERFACE_CLASS = "Interface service to other applications";

export const generateOverviewPDF = async (
  project: Project,
  previousProject?: Project,
  language: "fi" | "en" = "fi",
  classNameTranslation: Record<string, string> = {},
): Promise<void> => {
  const formatNumber = (value: number) => value.toFixed(2);
  const delta = (current: number, previous?: number) => {
    if (previous === undefined || current === previous) return "";
    const difference = current - previous;
    return ` <span class="delta">(${difference >= 0 ? "+" : ""}${formatNumber(difference)})</span>`;
  };
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
        : unspecified,
      count: group.components.reduce((sum, entry) => sum + entry.count, 0),
      points: group.components.reduce((sum, entry) => sum + entry.points, 0),
      possiblePoints: group.components.reduce(
        (sum, entry) => sum + entry.possiblePoints,
        0,
      ),
    }));

  const grouped = () => {
    const rows = summaryRows(
      getGroupedComponents(project.functionalComponents).parentGroups,
    ).sort((a, b) => b.possiblePoints - a.possiblePoints);
    const previousRows = previousProject
      ? summaryRows(
          getGroupedComponents(previousProject.functionalComponents)
            .parentGroups,
        )
      : undefined;
    const previousPoints = (name: string) =>
      previousRows
        ? previousRows.find((row) => row.name === name)?.points || 0
        : undefined;
    return rows
      .map(
        (row) => `<tr>
          <td>${escapeHtmlForSummary(row.name)}</td>
          <td>${row.count}</td>
          <td>${formatNumber(row.points)}${delta(row.points, previousPoints(row.name))} / ${formatNumber(row.possiblePoints)}</td>
          <td>${percentDone(row.points, row.possiblePoints)}</td>
        </tr>`,
      )
      .join("");
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
  ) => `<tr>
          <td>${label}</td>
          <td>${current.count}</td>
          <td>${formatNumber(current.points)}${delta(current.points, previous?.points)} / ${formatNumber(current.possiblePoints)}</td>
          <td>${percentDone(current.points, current.possiblePoints)}</td>
        </tr>`;
  const layers = calculateMLALayerDetails(project.functionalComponents);
  const messages = calculateMLAMessageCounts(project.functionalComponents);
  const externalInterfaces = calculateExternalInterfaceDetails(
    project.functionalComponents,
  );
  const externalInterfacePoints =
    externalInterfaces.toOtherApplications.points +
    externalInterfaces.fromOtherApplications.points;
  const externalInterfaceCount = // is this still neccessary
    externalInterfaces.toOtherApplications.count +
    externalInterfaces.fromOtherApplications.count;
  const businessOnlyPoints = layers.business.points - externalInterfacePoints;
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
          unspecified: "Ei valittu",
          inCount: "Saapuvat",
          outCount: "Lähtevät",
          interfaceSummary: "Liittymät",
          interface: "Liittymä",
          explanation: "Laskennan selitys ja tärkeät muutokset",
          changed:
            "Muuttuneet arvot on korostettu. Suluissa oleva luku kertoo eron edelliseen versioon.",
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
          unspecified: "Not selected",
          inCount: "Incoming",
          outCount: "Outgoing",
          interfaceSummary: "Interfaces",
          interface: "Interface",
          explanation: "Calculation explanation and important changes",
          changed:
            "Changed values are highlighted. The number in parentheses shows the difference from the previous version.",
        };
  const unspecified = labels.unspecified;
  const pointUnit = language === "fi" ? "TP" : "FP";
  const year = project.calculationDate?.slice(0, 4) || new Date().getFullYear();
  const filename = `${project.projectName}-Toiminnallisen-laajuuden-yhteenveto-${project.version}-${year}.pdf`;

  const html = `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtmlForSummary(filename)}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font: 10px Arial, sans-serif;
      color: #202020;
      margin: 0;
    }

    .page {
      /* min-height, not height: a fixed height doesn't clip overflowing content in the browser,
         but element.scrollHeight (which drives how tall html2canvas captures this element) never
         grows past a fixed height either, so any page whose content is taller than 273mm was
         silently cut off. min-height still fills a page that has little content. */
      min-height:273mm;
      /* Small bottom buffer: html2canvas measures this element's fractional (subpixel) rendered
         height and rounds it, so the very last pixel row of content can be clipped. A gap of
         real blank space at the bottom means anything lost to that rounding is blank, not text. */
      padding:0 12mm 4mm;
      break-after:page;
      position:relative;
      box-sizing:border-box;
    }

    .page:last-child {
      break-after: auto;
    }

    h1 {
      font-size: 30px;
      line-height: 1.2;
      color: #202020;
      margin: 0 0 12mm;
    }

    .report-date {
      display: block;
      font-size: 22px;
      font-weight: normal;
      margin-top: 4mm;
    }

    h2 {
      font-size: 16px;
      color: #25205f;
      border-bottom: 2px solid #25205f;
      padding-bottom: 10px;
    }

    h3 {
      font-size: 12px;
      line-height: 1.4;
      margin: 6mm 0 3mm;
      break-after: avoid;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 5mm 0;
    }

    th, td {
      border: 1px solid #999;
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #e9e8ef;
      font-size: 9px;
    }

    .changed {
      color: #b00020;
    }

    .delta {
      color: #087443;
      font-weight: bold;
      white-space: nowrap;
    }

    .report-contact, .notes {
      white-space: pre-wrap;
      border: 1px solid #999;
      padding: 6mm;
      min-height: 25mm;
      margin-top: 3mm;
    }

    .footer {
      position:absolute;
      bottom:0;
      left:12mm;
      right:12mm;
      border:1px solid #333;
      padding:4mm;
      font-size:9px;
    }

    .architecture {
      text-align: center;
      margin: 4mm auto 2mm;
      max-width: 130mm;
    }

    .architecture-total {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5mm;
    }

    .architecture-grid {
      display: grid;
      grid-template-columns: 68mm 26mm 34mm;
      grid-template-rows: 30mm 18mm 35mm 18mm 38mm;
      align-items: center;
      justify-items: center;
    }

    .layer {
      width: 62mm;
      min-height: 30mm;
      border: 1px solid #5b8cc5;
      background: linear-gradient(135deg, #b9d2ec, #75a6d5);
      padding: 5mm;
      text-align: center;
      font-size: 11px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .layer strong {
      font-size: 14px;
    }

    .layer-ui {
      grid-column: 1;
      grid-row: 1;
      border-radius: 8mm;
    }

    .layer-business {
      grid-column: 1;
      grid-row: 3;
      width: 68mm;
      min-height: 35mm;
    }

    .layer-database {
      grid-column: 1;
      grid-row: 5;
      border-radius: 50% / 15%;
      min-height: 38mm;
    }

    .layer-external {
      grid-column: 3;
      grid-row: 3;
      width: 30mm;
      min-height: 26mm;
      padding: 3mm;
      font-size: 9px;
      border-radius: 4mm;
    }

    .layer-external strong {
      font-size: 12px;
    }

    .junction-row {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6mm;
    }

    .junction-row-ui-business {
      grid-column: 1;
      grid-row: 2;
    }

    .junction-row-business-database {
      grid-column: 1;
      grid-row: 4;
    }

    .junction-row-business-external {
      grid-column: 2;
      grid-row: 3;
      flex-direction: column;
      gap: 3mm;
    }

    .junction {
      font-size: 9px;
      border: 1px solid #5b8cc5;
      background: #e5eff9;
      padding: 2mm;
      width: 27mm;
      position: relative;
    }

    .junction-narrow {
      width: 16mm;
      padding: 1.5mm;
    }

    .junction::after {
      content: "";
      position: absolute;
      border: 6mm solid transparent;
    }

    .junction-arrow-down::after {
      border-top-color: #5b8cc5;
      bottom: -12mm;
      left: 8mm;
    }

    .junction-arrow-up::after {
      border-bottom-color: #5b8cc5;
      top: -12mm;
      left: 8mm;
    }

    .junction-arrow-right::after {
      border-left-color: #5b8cc5;
      right: -11mm;
      top: calc(50% - 6mm); /* 6mm = half the 12mm arrow box, so it's vertically centered */
    }

    .junction-arrow-left::after {
      border-right-color: #5b8cc5;
      left: -11mm;
      top: calc(50% - 6mm);
    }

    .small {
      font-size: 9px;
    }

    @media print {
      body {
        print-color-adjust: exact;
      }

      .page {
        min-height: 273mm;
      }
    }
  </style>
</head>
<body>

  <section class="page">
    <h1>
      ${escapeHtmlForSummary(project.projectName)} - ${language === "fi" ? "toiminnallisen laajuuden yhteenveto" : "functional size overview"}
      <span class="report-date">${reportDate}</span>
    </h1>
    <div class="report-contact">${escapeHtmlForSummary(project.reportContactDetails)}</div>
    <div class="footer">FiSMA 1.1 Toiminnallisen koon mittaamisen menetelmä ISO/IEC 29881:2010</div>
  </section>

  <section class="page">
    <h2>${labels.calculation}</h2>

    <div class="architecture">
      <div class="architecture-total">
        ${labels.total} ${formatNumber(totalPoints)}${delta(totalPoints, previousTotalPoints)} / ${formatNumber(totalPossiblePoints)} ${pointUnit} – ${percentDone(totalPoints, totalPossiblePoints)}
      </div>

      <div class="architecture-grid">
        <div class="layer layer-ui">
          ${labels.uiLayer}
          <strong>${layers.ui.points.toFixed(2)} ${pointUnit}</strong>
          <span>${layers.ui.count} ${labels.functions}</span>
        </div>

        <div class="junction-row junction-row-ui-business">
          <div class="junction junction-arrow-down">
            ${messages.uiToBusiness} ${labels.interfaces}<br>${language === "fi" ? "sisään" : "in"}
          </div>
          <div class="junction junction-arrow-up">
            ${messages.businessToUi} ${labels.interfaces}<br>${language === "fi" ? "ulos" : "out"}
          </div>
        </div>

        <div class="layer layer-business">
          ${labels.businessLayer}
          <strong>${businessOnlyPoints.toFixed(2)} ${pointUnit}</strong>
          <span>${language === "fi" ? "Algoritmiset toiminnot" : "Algorithmic activities"}</span>
        </div>

        <div class="junction-row junction-row-business-external">
          <div class="junction junction-narrow junction-arrow-right">
            ${externalInterfaces.toOtherApplications.count}<br>${language === "fi" ? "ulos" : "out"}
          </div>
          <div class="junction junction-narrow junction-arrow-left">
            ${externalInterfaces.fromOtherApplications.count}<br>${language === "fi" ? "sisään" : "in"}
          </div>
        </div>

        <div class="layer layer-external">
          ${labels.externalLayer}
          <strong>${externalInterfacePoints.toFixed(2)} ${pointUnit}</strong>
          <span>${externalInterfaceCount} ${labels.interfaces}</span>
        </div>

        <div class="junction-row junction-row-business-database">
          <div class="junction junction-arrow-down">
            ${messages.businessToDatabase} ${labels.interfaces}<br>${language === "fi" ? "ulos" : "out"}
          </div>
          <div class="junction junction-arrow-up">
            ${messages.databaseToBusiness} ${labels.interfaces}<br>${language === "fi" ? "sisään" : "in"}
          </div>
        </div>

        <div class="layer layer-database">
          ${labels.databaseLayer}
          <strong>${layers.database.points.toFixed(2)} ${pointUnit}</strong>
          <span>${layers.database.count} ${labels.concepts}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="page">
    <h2>${labels.aggregates}</h2>

    <h3>${labels.classAggregate}</h3>
    <table>
      <thead>
        <tr>
          <th>${labels.functionClass}</th>
          <th>${labels.count}</th>
          <th>${labels.actionPoints}</th>
          <th>${labels.percentDone}</th>
        </tr>
      </thead>
      <tbody>
        ${grouped()}
      </tbody>
    </table>

    <h3>${labels.interfaceSummary}</h3>
    <table>
      <thead>
        <tr>
          <th>${labels.interface}</th>
          <th>${labels.count}</th>
          <th>${labels.actionPoints}</th>
          <th>${labels.percentDone}</th>
        </tr>
      </thead>
      <tbody>
        ${interfaceRow(labels.inCount, currentInterfaces.incoming, previousInterfaces?.incoming)}
        ${interfaceRow(labels.outCount, currentInterfaces.outgoing, previousInterfaces?.outgoing)}
      </tbody>
    </table>

    <h3>${labels.explanation}</h3>
    <div class="notes">${escapeHtmlForSummary(project.reportNotes)}</div>
    <p class="small">${labels.changed}</p>
  </section>

</body>
</html>`;

  await downloadHtmlAsPdf(html, filename, ".page");
};
