import * as d3 from "d3";

const loadAndCleanCSV2 = async (url) => {
  const data = await d3.csv(url, d => ({
    Country: d["Country/Region"]?.trim(),
    Continent: d.Continent?.trim(),
    Population: +d.Population?.replace(/,/g, "") || 0,
    TotalCases: +d.TotalCases?.replace(/,/g, "") || 0,
    NewCases: +d.NewCases?.replace(/,/g, "") || 0,
    TotalDeaths: +d.TotalDeaths?.replace(/,/g, "") || 0,
    NewDeaths: +d.NewDeaths?.replace(/,/g, "") || 0,
    TotalRecovered: +d.TotalRecovered?.replace(/,/g, "") || 0,
    NewRecovered: +d.NewRecovered?.replace(/,/g, "") || 0,
    ActiveCases: +d.ActiveCases?.replace(/,/g, "") || 0,
    SeriousCritical: +d["Serious,Critical"]?.replace(/,/g, "") || 0,
    CasesPerMillion: +d["Tot Cases/1M pop"]?.replace(/,/g, "") || 0,
    DeathsPerMillion: +d["Deaths/1M pop"]?.replace(/,/g, "") || 0,
    TotalTests: +d.TotalTests?.replace(/,/g, "") || 0,
    TestsPerMillion: +d["Tests/1M pop"]?.replace(/,/g, "") || 0,
    WHORegion: d["WHO Region"]?.trim(),
  }));

  return data.filter(d => d.Population > 0 && d.Country);
};

export default loadAndCleanCSV2;
