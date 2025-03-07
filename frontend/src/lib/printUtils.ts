import { Project } from "./types";

export const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const header = Object.keys(data[0]).join(', ');
    const rows = data.map(item => Object.values(item).join(', '));

    return [header, ...rows].join('\n');
};

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
//TODO: Should the project be passed here instead of making new request?
export const downloadProjectComponentsCsv = async (project: Project) => {
    const csvData = convertToCSV(project.functionalComponents);
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
        printingWindow.document.write(pdfContent);
        printingWindow.document.close();
        printingWindow.print();

        //if you just call .close() without timeout the window closes before the print dialogue can open
        //this also allows the window to close automatically after user prints or cancels printing
        setTimeout(() => printingWindow.close(), 500);
    }
}