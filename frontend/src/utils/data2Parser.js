import * as d3 from "d3";

const parseValue = (value) => {
  if (typeof value === 'string') {
    return +value.replace(/,/g, "") || 0;
  }
  return +value || 0;
};

const loadAndCleanCSV2 = async (url) => {
  const data = await d3.csv(url, d => ({
    Country: d["Country/Region"]?.trim(),
    Continent: d.Continent?.trim(),
    Population: parseValue(d.Population),
    TotalCases: parseValue(d.TotalCases),
    NewCases: parseValue(d.NewCases),
    TotalDeaths: parseValue(d.TotalDeaths),
    NewDeaths: parseValue(d.NewDeaths),
    TotalRecovered: parseValue(d.TotalRecovered),
    NewRecovered: parseValue(d.NewRecovered),
    ActiveCases: parseValue(d.ActiveCases),
    SeriousCritical: parseValue(d["Serious,Critical"]),
    CasesPerMillion: parseValue(d["Tot Cases/1M pop"]),
    DeathsPerMillion: parseValue(d["Deaths/1M pop"]),
    TotalTests: parseValue(d.TotalTests),
    TestsPerMillion: parseValue(d["Tests/1M pop"]),
    WHORegion: d["WHO Region"]?.trim(),
  }));

  return data.filter(d => d.Population > 0 && d.Country);
};

export default loadAndCleanCSV2;
