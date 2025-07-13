import Papa from "papaparse";

// Fix fields like "6.392.393.639.805.820" ➝ 6.39 (example)
function cleanNumberField(value) {
  if (typeof value === "string" && value.includes(".")) {
    const parts = value.split(".");
    const combined = parts.slice(0, 2).join("."); // Keep only first decimal point
    return parseFloat(combined);
  }
  return parseFloat(value);
}

export async function loadAndCleanCSV(path) {
  return new Promise((resolve, reject) => {
    Papa.parse(path, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        console.log("DataParser - Raw CSV results:", results);
        console.log("DataParser - Total rows parsed:", results.data.length);
        
        const cleaned = results.data.map(row => ({
          ...row,
          Hours_Worked_Per_Day: cleanNumberField(row.Hours_Worked_Per_Day),
          Meetings_Per_Day: cleanNumberField(row.Meetings_Per_Day),
          Productivity_Change: +row.Productivity_Change,
        }));
        
        // Filter out completely empty rows instead of just checking Hours_Worked_Per_Day
        const filtered = cleaned.filter(row => {
          return row.Stress_Level && row.Sector; // Check for key fields that should always exist
        });
        
        console.log("DataParser - Cleaned and filtered rows:", filtered.length);
        if (filtered.length > 0) {
          console.log("DataParser - Sample cleaned data:", filtered[0]);
        }
        
        resolve(filtered);
      },
      error: (error) => {
        console.error("DataParser - Error loading CSV:", error);
        reject(error);
      },
    });
  });
}
