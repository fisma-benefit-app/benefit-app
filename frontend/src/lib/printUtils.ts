import { Project, TGenericComponent } from "./types";
import {
  calculateComponentPointsWithMultiplier,
  calculateTotalPoints,
  calculateTotalPossiblePoints,
  calculateBasePoints,
} from "./centralizedCalculations.ts";

export const convertToCSV = (
  rows: Record<string, unknown>[],
  delimiter = ";",
) => {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const headerRow = headers.join(delimiter);

  const encodeCell = (v: unknown) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
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

  return {
    ...component,
    title: escapeCsv(component.title),
    description: escapeCsv(component.description),
  };
};

export const downloadProjectComponentsCsv = async (project: Project) => {
  const csvData = convertToCSV(
    project.functionalComponents.map((c) => encodeComponentForCSV(c, ";")),
    ";",
  );
  downloadCSV(csvData, `${project.projectName}.csv`);
};

// Compares values for current and previous project, then returns changed values in blue and bold text
const valueComparer = (
  currentValue: string | number | null,
  prevValue: string | number | null,
) => {
  const changed = prevValue !== currentValue;
  const className = changed ? "project-data highlighted" : "project-data";
  return `<span class="${className}">${(changed ? currentValue : prevValue) ?? ""}</span>`;
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

  const pdfContent = `
    <html>
      <head>
        <title>${printUtilsTranslation.projectReport}</title>
        <style>
          .project-data {
            font-weight: normal;
          }
          .highlighted {
            color: blue;
            font-weight: bold;
          }
          body { font-family: Arial, sans-serif;  padding: 20px; }
          h1 { text-align: center; }
          .project-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 5px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; background-color: #ddd; }
        </style>
      </head>
      <body>
        <h1>${printUtilsTranslation.projectReport}: ${project.projectName}</h1>
        <div class="project-info">
          <p><strong>${printUtilsTranslation.projectId}:</strong> ${valueComparer(project.id, oldProject.id)}</p>
          <p><strong>${printUtilsTranslation.version}:</strong> ${valueComparer(project.version, oldProject.version)}</p>
          <p><strong>${printUtilsTranslation.createdDate}:</strong> ${valueComparer(dateLocalizer(project.createdAt), dateLocalizer(oldProject.createdAt))}</p>
          <p><strong>${printUtilsTranslation.versionCreatedDate}:</strong> ${valueComparer(dateLocalizer(project.versionCreatedAt), dateLocalizer(oldProject.versionCreatedAt))}</p>
          <p><strong>${printUtilsTranslation.lastEditedDate}:</strong> ${valueComparer(dateLocalizer(project.updatedAt), dateLocalizer(oldProject.updatedAt))}</p>
        </div>
        <table>
          <tr>
            <th>${printUtilsTranslation.title}</th>
            <th>${printUtilsTranslation.description}</th>
            <th>${printUtilsTranslation.className}</th>
            <th>${printUtilsTranslation.componentType}</th>
            <th>${printUtilsTranslation.dataElements}</th>
            <th>${printUtilsTranslation.readingReferences}</th>
            <th>${printUtilsTranslation.writingReferences}</th>
            <th>${printUtilsTranslation.operations}</th>
            <th>${printUtilsTranslation.degreeOfCompletion}</th>
            <th>${printUtilsTranslation.functionalPoints}</th>
            <th>${printUtilsTranslation.totalPossiblePoints}</th>
          </tr>
          ${project.functionalComponents
            .map((comp) => {
              // This returns an error "Type null cannot be used as an index type.", but it works for now

              let prevComp: TGenericComponent | null = null;

              if (comp.previousFCId) {
                prevComp = previousComponentsMap[comp.previousFCId];
              }

              return `
            <tr>
              <td>${valueComparer(comp.title, prevComp?.title || null)}</td>
              <td>${valueComparer(comp.description, prevComp?.description || null)}</td>
              <td>${valueComparer(
                classNameTranslation[comp.className] || comp.className,
                prevComp?.className
                  ? classNameTranslation[prevComp?.className] ||
                      prevComp.className
                  : null,
              )}</td>
              <td>${valueComparer(
                comp.componentType
                  ? componentTypeTranslation[comp.componentType] ||
                      comp.componentType
                  : null,
                prevComp?.componentType
                  ? componentTypeTranslation[prevComp.componentType] ||
                      prevComp.componentType
                  : null,
              )}</td>
              <td>${valueComparer(comp.dataElements, prevComp?.dataElements || null)}</td>
              <td>${valueComparer(comp.readingReferences, prevComp?.readingReferences || null)}</td>
              <td>${valueComparer(comp.writingReferences, prevComp?.writingReferences || null)}</td>
              <td>${valueComparer(comp.operations, prevComp?.operations || null)}</td>
              <td>${valueComparer(comp.degreeOfCompletion, prevComp?.degreeOfCompletion || null)}</td>
              <td>${valueComparer(
                calculateComponentPointsWithMultiplier(
                  comp || null,
                  comp.degreeOfCompletion,
                ).toFixed(2),
                calculateComponentPointsWithMultiplier(
                  prevComp || null,
                  prevComp?.degreeOfCompletion || null,
                ).toFixed(2),
              )}</td>
              <td>${valueComparer(
                calculateBasePoints(comp).toFixed(2),
                prevComp ? calculateBasePoints(prevComp).toFixed(2) : "0.00",
              )}</td>
            </tr>
            `;
            })
            .join("")}
          <tr class="total-row">
            <td colspan="9"><b>${printUtilsTranslation.totalFunctionalPoints}</b></td>
            <td><b>${valueComparer(calculateTotalPoints(project.functionalComponents).toFixed(2), calculateTotalPoints(oldProject.functionalComponents).toFixed(2))}</b></td>
            <td><b>${valueComparer(calculateTotalPossiblePoints(project.functionalComponents).toFixed(2), calculateTotalPossiblePoints(oldProject.functionalComponents).toFixed(2))}</b></td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const printingWindow = window.open("", "_blank", "width=800,height=600");
  if (printingWindow) {
    printingWindow.document.documentElement.innerHTML = pdfContent;
    printingWindow.document.close();
    printingWindow.print();
    setTimeout(() => printingWindow.close(), 500);
  }
};
