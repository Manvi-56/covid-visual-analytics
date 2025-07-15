import Papa from "papaparse";

// Fix fields like "6.392.393.639.805.820" ➝ 6.39 (example)
function cleanNumberField(value) {
  console.log("cleanNumberField input:", value, typeof value);
  if (typeof value === "string" && value.includes(".")) {
    const parts = value.split(".");
    const combined = parts.slice(0, 2).join("."); // Keep only first decimal point
    const result = parseFloat(combined);
    console.log("cleanNumberField string result:", combined, "->", result);
    return result;
  }
  const result = parseFloat(value);
  console.log("cleanNumberField direct result:", result);
  return result;
}

export async function loadAndCleanCSV(path) {
  return new Promise((resolve, reject) => {
    Papa.parse(path, {
      download: true,
      header: true,
      dynamicTyping: false, // Keep as strings to process manually
      complete: (results) => {
        console.log("DataParser - Raw CSV results:", results);
        console.log("DataParser - Total rows parsed:", results.data.length);
        
        const cleaned = results.data.map((row, index) => {
          const originalHours = row.Hours_Worked_Per_Day;
          const cleanedHours = cleanNumberField(originalHours);
          
          if (index < 5) {
            console.log(`DataParser - Row ${index}: Hours "${originalHours}" -> ${cleanedHours}`);
          }
          
          return {
            ...row,
            Hours_Worked_Per_Day: cleanedHours,
            Meetings_Per_Day: cleanNumberField(row.Meetings_Per_Day),
            Productivity_Change: +row.Productivity_Change,
          };
        });
        
        // Filter out completely empty rows and unrealistic values
        const filtered = cleaned.filter(row => {
          // Check for key fields that should always exist
          const hasRequiredFields = row.Stress_Level && row.Sector;
          
          // Check for realistic hours (1-24 hours per day - basic sanity check)
          const hasRealisticHours = row.Hours_Worked_Per_Day >= 1 && row.Hours_Worked_Per_Day <= 24;
          
          if (!hasRealisticHours && row.Hours_Worked_Per_Day > 0) {
            console.log(`DataParser - Filtering out unrealistic hours: ${row.Hours_Worked_Per_Day} for sector ${row.Sector}`);
          }
          
          return hasRequiredFields && hasRealisticHours;
        });
        
        console.log("DataParser - Cleaned and filtered rows:", filtered.length);
        console.log("DataParser - Rows removed due to unrealistic hours:", cleaned.length - filtered.length);
        
        if (filtered.length > 0) {
          console.log("DataParser - Sample cleaned data:", filtered[0]);
          
          // Log sector distribution to verify data diversity
          const sectorCounts = {};
          filtered.forEach(row => {
            sectorCounts[row.Sector] = (sectorCounts[row.Sector] || 0) + 1;
          });
          console.log("DataParser - Sector distribution:", sectorCounts);
          
          // Calculate and log sector average hours
          const sectorHours = {};
          filtered.forEach(row => {
            if (!sectorHours[row.Sector]) {
              sectorHours[row.Sector] = [];
            }
            sectorHours[row.Sector].push(row.Hours_Worked_Per_Day);
          });
          
          Object.keys(sectorHours).forEach(sector => {
            const hours = sectorHours[sector];
            const avg = hours.reduce((sum, h) => sum + h, 0) / hours.length;
            console.log(`DataParser - ${sector}: ${hours.length} records, avg: ${avg.toFixed(2)} hours`);
          });
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
