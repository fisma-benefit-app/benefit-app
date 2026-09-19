import Papa from "papaparse";

/**
 * Helper function: Converts numbers to European format (e.g., "1,13" -> 1.13)
 */
export const parseEuropeanNumber = (value?: string): number => {
  if (!value) return 0;
  
  let cleanValue = value.toString().trim().replace(/"/g, "");
  
  // Change commas to periods
  cleanValue = cleanValue.replace(",", ".");
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Read and parse CSV files
 */
export const parseCsvFile = (file: File): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true, 
      delimiter: ";",
      skipEmptyLines: true, // Ignore blank lines at the end of the file.
      complete: (results) => {
        console.log("Raw parsed CSV:", results.data);
        console.log("Header list:", results.meta.fields);
        
        resolve(results.data as Record<string, string>[]);
      },
      error: (error: Error) => {
        console.error("CSV parse error:", error);
        reject(error);
      },
    });
  });
};

