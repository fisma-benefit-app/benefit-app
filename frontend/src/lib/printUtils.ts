import { Project, TGenericComponent } from "./types";
import { getCalculateFuntion } from "./fc-service-functions.ts";

export const convertToCSV = <T extends Record<string, unknown>>(data: T[]) => {
  if (data.length === 0) return "";

  const header = Object.keys(data[0]).join(", ");
  const rows = data.map((item) => Object.values(item).join(", "));

  return [header, ...rows].join("\n");
};

export const encodeComponentForCSV = (component: TGenericComponent) => ({
  ...component,
  // CSV can't handle commas inside cells without quotation marks, so let's wrap all comments with ""
  title: component.title ? `"${component.title.replace(/[",]/g, "")}"` : null,
  description: component.description
    ? `"${component.description.replace(/[",]/g, "")}"`
    : null,
});

export const downloadCSV = (csvData: string, filename: string = "data.csv") => {
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadProjectComponentsCsv = async (project: Project) => {
  const csvData = convertToCSV(
    project.functionalComponents.map(encodeComponentForCSV),
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

//  calculate-funktiot kopioituna (tätä vois yksinkertaistaa?)
const calculateFunctionalComponentPoints = (
  component: TGenericComponent | null,
  multiplier: number | null,
) => {
  if (!component) return 0;
  if (!component.className || !component.componentType) return 0;
  const calculateFunction = getCalculateFuntion(component.className);
  const basePoints = calculateFunction ? calculateFunction(component) : 0;
  console.log(basePoints);
  console.log(multiplier);
  return multiplier != null ? basePoints * multiplier : basePoints;
};

// Calculates total functional points from all components of a project
const calculateTotalFunctionalComponentPoints = (
  components: TGenericComponent[],
) => {
  let totalPoints = 0;
  for (const component of components) {
    totalPoints += calculateFunctionalComponentPoints(
      component,
      component.degreeOfCompletion,
    );
  }
  return totalPoints;
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
          <p><strong>${printUtilsTranslation.createdDate}:</strong> ${valueComparer(dateLocalizer(project.createdDate), dateLocalizer(oldProject.createdDate))}</p>
          <p><strong>${printUtilsTranslation.versionCreatedDate}:</strong> ${valueComparer(dateLocalizer(project.versionDate), dateLocalizer(oldProject.versionDate))}</p>
          <p><strong>${printUtilsTranslation.lastEditedDate}:</strong> ${valueComparer(dateLocalizer(project.editedDate), dateLocalizer(oldProject.editedDate))}</p>
        </div>
        <table>
          <tr>
            <th>${printUtilsTranslation.className}</th>
            <th>${printUtilsTranslation.componentType}</th>
            <th>${printUtilsTranslation.dataElements}</th>
            <th>${printUtilsTranslation.readingReferences}</th>
            <th>${printUtilsTranslation.writingReferences}</th>
            <th>${printUtilsTranslation.operations}</th>
            <th>${printUtilsTranslation.degreeOfCompletion}</th>
            <th>${printUtilsTranslation.functionalPoints}</th>
            <th>${printUtilsTranslation.title}</th>
            <th>${printUtilsTranslation.description}</th>
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
              <td>${valueComparer(
                classNameTranslation[comp.className],
                prevComp?.className
                  ? classNameTranslation[prevComp?.className]
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
                calculateFunctionalComponentPoints(
                  comp || null,
                  comp.degreeOfCompletion,
                ).toFixed(2),
                calculateFunctionalComponentPoints(
                  prevComp || null,
                  prevComp?.degreeOfCompletion || null,
                ).toFixed(2),
              )}</td>
              <td>${valueComparer(comp.title, prevComp?.title || null)}</td>
            </tr>
            `;
            })
            .join("")}
          <tr class="total-row">
            <td colspan="8"><b>${printUtilsTranslation.totalFunctionalPoints}</b></td>
            <td colspan="2"><b>${valueComparer(calculateTotalFunctionalComponentPoints(project.functionalComponents).toFixed(2), calculateTotalFunctionalComponentPoints(oldProject.functionalComponents).toFixed(2))}</b></td>
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
