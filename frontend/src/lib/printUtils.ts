import { Project, TGenericComponent } from "./types";
//TODO: Fix eslint alerts!
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

export const createPdf = (project: Project) => {

  //TODO: write raport HTML/CSS/JS
  const pdfContent: string = `
  <html>
    <head>
      <title>Project</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; display: flex; justify-content: center }
        #name { font-size: 45; }
      </style>
    </head>
    <body>
      <p id="name">${project.projectName}</p>
    </body>
  </html>
`

  const printingWindow = window.open("", "_blank", "width=800,height=600");

  if (printingWindow) {
    printingWindow.document.documentElement.innerHTML = pdfContent;

    //if you just call .close() without timeout the window closes before the print dialogue can open
    //this also allows the window to close automatically after user prints or cancels printing
    printingWindow.onload = () => {
      printingWindow.print();
      setTimeout(() => printingWindow.close(), 500);
    };
  }
}