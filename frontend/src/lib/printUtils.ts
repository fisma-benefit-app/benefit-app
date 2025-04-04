import { Project, TGenericComponent } from "./types";
import { getCalculateFuntion } from '../lib/fc-service-functions';

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


export const createPdf = (project: Project) => {
  const totalPoints = calculateTotalFunctionalComponentPoints(project.functionalComponents);

  const pdfContent = `
    <html>
      <head>
        <title>Project Report</title>
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
        <h1>Project Report: ${project.projectName}</h1>
        <div class="project-info">
          <p><strong>Project ID:</strong> ${project.id}</p>
          <p><strong>Version:</strong> ${project.version}</p>
          <p><strong>Created Date:</strong> ${project.createdDate}</p>
          <p><strong>Last Edited Date:</strong> ${project.editedDate}</p>
        </div>
        <table>
          <tr>
            <th>Class Name</th>
            <th>Component Type</th>
            <th>Data Elements</th>
            <th>Reading References</th>
            <th>Writing References</th>
            <th>Functional Multiplier</th>
            <th>Operations</th>
            <th>Degree of Completion</th>
            <th>Functional Points</th>
            <th>Comment</th>
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
            <td colspan="8"><b>Total Functional Points</b></td>
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