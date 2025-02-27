import { fetchProject } from "../api/project";

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

export const downloadProjectComponentsCsv = async (id: string) => {
    const sessionToken = sessionStorage.getItem("loginToken");
    const project = await fetchProject(sessionToken, id);
    const csvData = convertToCSV(project.functionalComponents);
    downloadCSV(csvData, 'project.csv');
}