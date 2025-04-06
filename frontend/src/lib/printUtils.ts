import { Project, TGenericComponent } from "./types";
import { getCalculateFuntion } from './fc-service-functions.ts';



export const convertToCSV = (data: any[]) => {
  if (data.length === 0) return '';

  const header = Object.keys(data[0]).join(', ');
  const rows = data.map(item => Object.values(item).join(', '));

  return [header, ...rows].join('\n');
};

export const encodeComponentForCSV = (component: TGenericComponent) => ({
  ...component,
  // CSV can't handle commas inside cells without quotation marks, so let's wrap all comments with ""
  comment: component.comment ? `"${component.comment.replace(/\"/g, "")}"` : null
})

export const downloadCSV = (csvData: string, filename: string = 'data.csv') => {
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadProjectComponentsCsv = async (project: Project) => {
  const csvData = convertToCSV(project.functionalComponents.map(encodeComponentForCSV));
  downloadCSV(csvData, `${project.projectName}.csv`);
}

/*// Compares values for current and previous project
let isNewValue = false;
const valueComparer = (value1, value2) => {
  if (value1 === value2) {
    return value1;
  } else {
    isNewValue = true;
    return value2;
  }
}*/

const dateLocalizer = (insertedDate: string) => {
  return new Date(insertedDate).toLocaleTimeString("fi-FI", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace("klo", "")
}


//  calculate-funktiot kopioituna (tätä vois yksinkertaistaa?)
const calculateFunctionalComponentPoints = (component: TGenericComponent) => {
  if (!component.className || !component.componentType) return 0
  const calculateFunction = getCalculateFuntion(component.className);
  //@ts-expect-error(TODO - component should be typed before it goes to the calculation)
  return calculateFunction ? calculateFunction(component) : 0;
};

const calculateTotalFunctionalComponentPoints = (components: TGenericComponent[]) => {
  let totalPoints = 0;
  for (const component of components) {
    totalPoints += calculateFunctionalComponentPoints(component);
  }
  return totalPoints;
};


export const createPdf = (project: Project, translation: {
  projectReport: string,
  projectId: string,
  version: string,
  createdDate: string,
  versionCreatedDate: string,
  lastEditedDate: string,
  className: string,
  componentType: string,
  dataElements: string,
  readingReferences: string,
  writingReferences: string,
  functionalMultiplier: string,
  operations: string,
  degreeOfCompletion: string,
  functionalPoints: string,
  comment: string,
  totalFunctionalPoints: string,
}) => {
  const totalPoints = calculateTotalFunctionalComponentPoints(project.functionalComponents);

  const pdfContent = `
    <html>
      <head>
        <title>${translation.projectReport}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          .project-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; background-color: #ddd; }
        </style>
      </head>
      <body>
        <h1>${translation.projectReport}: ${project.projectName}</h1>
        <div class="project-info">
          <p><strong>${translation.projectId}:</strong> ${project.id}</p>
          <p><strong>${translation.version}:</strong> ${project.version}</p>
          <p><strong>${translation.createdDate}:</strong> ${dateLocalizer(project.createdDate)}</p>
          <p><strong>${translation.versionCreatedDate}:</strong> ${dateLocalizer(project.versionDate)}</p>
          <p><strong>${translation.lastEditedDate}:</strong> ${dateLocalizer(project.editedDate)}</p>
        </div>
        <table>
          <tr>
            <th>${translation.className}</th>
            <th>${translation.componentType}</th>
            <th>${translation.dataElements}</th>
            <th>${translation.readingReferences}</th>
            <th>${translation.writingReferences}</th>
            <th>${translation.functionalMultiplier}</th>
            <th>${translation.operations}</th>
            <th>${translation.degreeOfCompletion}</th>
            <th>${translation.functionalMultiplier}</th>
            <th>${translation.comment}</th>
          </tr>
          ${project.functionalComponents.map(comp => `
            <tr>
              <td>${comp.className || "N/A"}</td>
              <td>${comp.componentType || "N/A"}</td>
              <td>${comp.dataElements ?? "N/A"}</td>
              <td>${comp.readingReferences ?? "N/A"}</td>
              <td>${comp.writingReferences ?? "N/A"}</td>
              <td>${comp.functionalMultiplier ?? "N/A"}</td>
              <td>${comp.operations ?? "N/A"}</td>
              <td>${comp.degreeOfCompletion ?? "N/A"}</td>
              <td>${calculateFunctionalComponentPoints(comp).toFixed(2)}</td>
              <td>${comp.comment || "No comment"}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="8"><b>${translation.totalFunctionalPoints}</b></td>
            <td colspan="2"><b>${totalPoints.toFixed(2)}</b></td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const printingWindow = window.open("", "_blank", "width=800,height=600");
  if (printingWindow) {
    printingWindow.document.write(pdfContent);
    printingWindow.document.close();
    printingWindow.print();
    setTimeout(() => printingWindow.close(), 500);
  }
};