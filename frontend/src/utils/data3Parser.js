import * as d3 from "d3";

/**
 * Parses and cleans the India state-wise COVID data from CSV.
 * @param {string} url - Path or URL to the CSV file.
 * @returns {Promise<Array<Object>>} - Cleaned data array.
 */
const loadAndCleanIndiaCovid = async (url) => {
  const data = await d3.csv(url, d => ({
    State: d.State?.trim(),
    StateCode: d.State_code?.trim(),
    Confirmed: +d.Confirmed?.replace(/,/g, "") || 0,
    Recovered: +d.Recovered?.replace(/,/g, "") || 0,
    Deaths: +d.Deaths?.replace(/,/g, "") || 0,
    Active: +d.Active?.replace(/,/g, "") || 0,
    MigratedOther: +d.Migrated_Other?.replace(/,/g, "") || 0,
    LastUpdated: d.Last_Updated_Time?.trim(),
  }));

  // Filter out any invalid or empty rows
  return data.filter(d => d.State && d.Confirmed >= 0);
};

export default loadAndCleanIndiaCovid;
