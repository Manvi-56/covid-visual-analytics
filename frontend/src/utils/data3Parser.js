import * as d3 from "d3";

const parseValue = (value) => {
  if (typeof value === 'string') {
    return +value.replace(/,/g, "") || 0;
  }
  return +value || 0;
};

/**
 * Parses and cleans the India state-wise COVID data from CSV.
 * @param {string} url - Path or URL to the CSV file.
 * @returns {Promise<Array<Object>>} - Cleaned data array.
 */
const loadAndCleanIndiaCovid = async (url) => {
  const data = await d3.csv(url, d => ({
    State: d.State?.trim(),
    Population: parseValue(d.Population),
    Confirmed: parseValue(d.Confirmed),
    Active: parseValue(d.Active),
    Deaths: parseValue(d.Deaths),
    // Calculate derived metrics
    Recovered: Math.max(0, parseValue(d.Confirmed) - parseValue(d.Active) - parseValue(d.Deaths)),
    CaseFatalityRate: parseValue(d.Confirmed) > 0 ? (parseValue(d.Deaths) / parseValue(d.Confirmed) * 100) : 0,
    ActiveRate: parseValue(d.Confirmed) > 0 ? (parseValue(d.Active) / parseValue(d.Confirmed) * 100) : 0,
  }));

  // Filter out any invalid or empty rows, and exclude the "Total" row
  return data.filter(d => d.State && d.State !== 'Total' && d.Confirmed >= 0);
};

export default loadAndCleanIndiaCovid;
