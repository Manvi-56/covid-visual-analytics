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
        const cleaned = results.data.map(row => ({
          ...row,
          Hours_Worked_Per_Day: cleanNumberField(row.Hours_Worked_Per_Day),
          Meetings_Per_Day: cleanNumberField(row.Meetings_Per_Day),
          Productivity_Change: +row.Productivity_Change,
        }));
        resolve(cleaned.filter(row => !isNaN(row.Hours_Worked_Per_Day)));
      },
      error: (error) => reject(error),
    });
  });
}
