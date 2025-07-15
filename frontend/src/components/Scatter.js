import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const MortalityRecoveryScatterPlot = ({ data }) => {
  const svgRef = useRef();
  const timelineRef = useRef();
  const barRef = useRef();
  const [selectedContinent, setSelectedContinent] = useState("All");
  const [viewMode, setViewMode] = useState("scatter");

  const margin = { top: 80, right: 200, bottom: 90, left: 90 },
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const cleanedData = data
      .filter(d => d.TotalCases > 0 && d.TotalDeaths >= 0 && d.TotalRecovered >= 0)
      .map(d => ({
        country: d["Country"] || d["Country/Region"],
        continent: d.Continent || 'Unknown',
        totalCases: +d.TotalCases,
        totalDeaths: +d.TotalDeaths,
        totalRecovered: +d.TotalRecovered,
        population: +d.Population || 0,
        mortalityRate: +d.TotalDeaths / +d.TotalCases,
        recoveryRate: +d.TotalRecovered / +d.TotalCases,
        activeCases: +d.TotalCases - +d.TotalDeaths - +d.TotalRecovered,
        cfr: (+d.TotalDeaths / +d.TotalCases) * 100, // Case Fatality Rate
        outcomeRate: ((+d.TotalDeaths + +d.TotalRecovered) / +d.TotalCases) * 100, // Outcome resolution rate
      }))
      .filter(d => d.mortalityRate >= 0 && d.recoveryRate >= 0 && (!selectedContinent || selectedContinent === "All" || d.continent === selectedContinent));

    if (viewMode === "scatter") {
      // Enhanced scatter plot
      const x = d3.scaleLinear()
        .domain([0, d3.max(cleanedData, d => d.recoveryRate) * 1.1])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(cleanedData, d => d.mortalityRate) * 1.1])
        .range([height, 0]);

      const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(cleanedData, d => d.totalCases)])
        .range([3, 20]);

      const continentColors = {
        "Asia": "#3b82f6",
        "Europe": "#10b981", 
        "North America": "#f59e0b",
        "South America": "#ef4444",
        "Africa": "#8b5cf6",
        "Oceania": "#06b6d4",
        "Unknown": "#6b7280"
      };

      // Add gridlines
      g.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
          .tickSize(-height)
          .tickFormat("")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);

      g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat("")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);

      // Axes
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format(".0%")))
        .selectAll("text")
        .style("font-size", "12px");

      g.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(".0%")))
        .selectAll("text")
        .style("font-size", "12px");

      // Enhanced tooltip
      const tooltip = d3.select("body")
        .selectAll(".recovery-tooltip")
        .data([null])
        .join("div")
        .attr("class", "recovery-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(15, 23, 42, 0.95)")
        .style("color", "white")
        .style("padding", "12px 16px")
        .style("border-radius", "8px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("box-shadow", "0 10px 25px rgba(0, 0, 0, 0.3)")
        .style("backdrop-filter", "blur(10px)")
        .style("border", "1px solid rgba(255, 255, 255, 0.1)")
        .style("z-index", "9999");

      // Data points
      g.selectAll("circle")
        .data(cleanedData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.recoveryRate))
        .attr("cy", d => y(d.mortalityRate))
        .attr("r", d => sizeScale(d.totalCases))
        .attr("fill", d => continentColors[d.continent] || "#6b7280")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("opacity", 0.7)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 1)
            .attr("stroke-width", 2)
            .attr("r", sizeScale(d.totalCases) + 3);

          const tooltipContent = `
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #60A5FA;">
              🏥 ${d.country}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #ef4444; font-size: 14px;">●</span> 
              <span style="font-weight: 600;">Total Cases:</span> 
              <span style="color: #F1F5F9; font-weight: bold;">${d.totalCases.toLocaleString()}</span>
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #10b981; font-size: 14px;">●</span> 
              <span style="font-weight: 600;">Recovery Rate:</span> 
              <span style="color: #F1F5F9; font-weight: bold;">${(d.recoveryRate * 100).toFixed(1)}%</span>
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #f59e0b; font-size: 14px;">●</span> 
              <span style="font-weight: 600;">Mortality Rate:</span> 
              <span style="color: #F1F5F9; font-weight: bold;">${(d.mortalityRate * 100).toFixed(1)}%</span>
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #8b5cf6; font-size: 14px;">●</span> 
              <span style="font-weight: 600;">Case Fatality Rate:</span> 
              <span style="color: #F1F5F9; font-weight: bold;">${d.cfr.toFixed(2)}%</span>
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #06b6d4; font-size: 14px;">●</span> 
              <span style="font-weight: 600;">Active Cases:</span> 
              <span style="color: #F1F5F9; font-weight: bold;">${d.activeCases.toLocaleString()}</span>
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #3b82f6; font-size: 14px;">●</span> 
              <span style="font-weight: 600;">Outcome Resolution:</span> 
              <span style="color: #F1F5F9; font-weight: bold;">${d.outcomeRate.toFixed(1)}%</span>
            </div>
            <div style="font-size: 11px; color: #94A3B8; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              📍 ${d.continent} • Bubble size = Total Cases
            </div>
          `;

          tooltip
            .html(tooltipContent)
            .style("opacity", 1);
        })
        .on("mousemove", function(event) {
          tooltip
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 0.7)
            .attr("stroke-width", 1)
            .attr("r", d => sizeScale(d.totalCases));

          tooltip.style("opacity", 0);
        });

      // Add trend line
      const trendLine = d3.line()
        .x(d => x(d.recoveryRate))
        .y(d => y(d.mortalityRate));

      // Simple trend analysis
      const sortedData = cleanedData.sort((a, b) => a.recoveryRate - b.recoveryRate);
      const movingAverage = [];
      const windowSize = Math.max(3, Math.floor(sortedData.length / 10));
      
      for (let i = windowSize; i < sortedData.length - windowSize; i++) {
        const window = sortedData.slice(i - windowSize, i + windowSize);
        const avgRecovery = d3.mean(window, d => d.recoveryRate);
        const avgMortality = d3.mean(window, d => d.mortalityRate);
        movingAverage.push({ recoveryRate: avgRecovery, mortalityRate: avgMortality });
      }

      if (movingAverage.length > 1) {
        g.append("path")
          .datum(movingAverage)
          .attr("fill", "none")
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("opacity", 0.7)
          .attr("d", trendLine);
      }

      // Legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width + margin.left + 20}, ${margin.top + 20})`);

      legend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Continents:");

      Object.entries(continentColors).forEach(([continent, color], i) => {
        if (continent === "Unknown") return;
        const legendItem = legend.append("g")
          .attr("transform", `translate(0, ${25 + i * 25})`);

        legendItem.append("circle")
          .attr("cx", 8)
          .attr("cy", 0)
          .attr("r", 6)
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1);

        legendItem.append("text")
          .attr("x", 20)
          .attr("y", 4)
          .style("font-size", "12px")
          .style("fill", "#333")
          .text(continent);
      });

      // Chart title
      svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#1F2937")
        .text("COVID-19 Recovery vs Mortality Analysis");

      // Subtitle
      svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#6B7280")
        .text("Bubble size represents total cases • Dashed line shows trend");

      // Axis labels
      svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 70)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#6B7280")
        .text("Recovery Rate (%)");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2) - margin.top)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#6B7280")
        .text("Mortality Rate (%)");

    } else if (viewMode === "bar") {
      // Bar chart showing recovery statistics by continent - always show all continents
      const allData = data
        .filter(d => d.TotalCases > 0 && d.TotalDeaths >= 0 && d.TotalRecovered >= 0)
        .map(d => ({
          country: d["Country"] || d["Country/Region"],
          continent: d.Continent || 'Unknown',
          totalCases: +d.TotalCases,
          totalDeaths: +d.TotalDeaths,
          totalRecovered: +d.TotalRecovered,
          mortalityRate: +d.TotalDeaths / +d.TotalCases,
          recoveryRate: +d.TotalRecovered / +d.TotalCases,
        }))
        .filter(d => d.mortalityRate >= 0 && d.recoveryRate >= 0);

      const continentStats = d3.group(allData, d => d.continent);
      const continentData = Array.from(continentStats, ([continent, countries]) => ({
        continent,
        avgRecoveryRate: d3.mean(countries, d => d.recoveryRate),
        avgMortalityRate: d3.mean(countries, d => d.mortalityRate),
        totalCases: d3.sum(countries, d => d.totalCases),
        totalRecovered: d3.sum(countries, d => d.totalRecovered),
        totalDeaths: d3.sum(countries, d => d.totalDeaths),
        countries: countries.length
      })).filter(d => d.continent !== 'Unknown');

      const x = d3.scaleBand()
        .domain(continentData.map(d => d.continent))
        .range([0, width])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(continentData, d => Math.max(d.avgRecoveryRate, d.avgMortalityRate))])
        .range([height, 0]);

      const continentColors = {
        "Asia": "#3b82f6",
        "Europe": "#10b981", 
        "North America": "#f59e0b",
        "South America": "#ef4444",
        "Africa": "#8b5cf6",
        "Oceania": "#06b6d4"
      };

      // Add gridlines
      g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat("")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);

      // Axes
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "12px")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

      g.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(".0%")))
        .selectAll("text")
        .style("font-size", "12px");

      // Enhanced tooltip for bar chart
      const tooltip = d3.select("body")
        .selectAll(".recovery-bar-tooltip")
        .data([null])
        .join("div")
        .attr("class", "recovery-bar-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(15, 23, 42, 0.95)")
        .style("color", "white")
        .style("padding", "12px 16px")
        .style("border-radius", "8px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("box-shadow", "0 10px 25px rgba(0, 0, 0, 0.3)")
        .style("backdrop-filter", "blur(10px)")
        .style("border", "1px solid rgba(255, 255, 255, 0.1)")
        .style("z-index", "9999");

      // Recovery rate bars
      g.selectAll(".recovery-bar")
        .data(continentData)
        .enter()
        .append("rect")
        .attr("class", "recovery-bar")
        .attr("x", d => x(d.continent))
        .attr("y", d => y(d.avgRecoveryRate))
        .attr("width", x.bandwidth() / 2)
        .attr("height", d => height - y(d.avgRecoveryRate))
        .attr("fill", "#10b981")
        .attr("opacity", 0.7)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 1);
          
          const tooltipContent = `
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #60A5FA;">
              🌍 ${d.continent} - Recovery Rate
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #10b981; font-size: 14px;">●</span> 
              <span style="font-weight: 600;">Average Recovery Rate:</span> 
              <span style="color: #F1F5F9; font-weight: bold;">${(d.avgRecoveryRate * 100).toFixed(1)}%</span>
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #3b82f6; font-size: 14px;">●</span> 
              <span style="font-weight: 600;">Total Cases:</span> 
              <span style="color: #F1F5F9; font-weight: bold;">${d.totalCases.toLocaleString()}</span>
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #10b981; font-size: 14px;">●</span> 
              <span style="font-weight: 600;">Total Recovered:</span> 
              <span style="color: #F1F5F9; font-weight: bold;">${d.totalRecovered.toLocaleString()}</span>
            </div>
            <div style="font-size: 11px; color: #94A3B8; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              📊 ${d.countries} countries analyzed
            </div>
          `;

          tooltip
            .html(tooltipContent)
            .style("opacity", 1)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 0.7);
          tooltip.style("opacity", 0);
        });

      // Mortality rate bars
      g.selectAll(".mortality-bar")
        .data(continentData)
        .enter()
        .append("rect")
        .attr("class", "mortality-bar")
        .attr("x", d => x(d.continent) + x.bandwidth() / 2)
        .attr("y", d => y(d.avgMortalityRate))
        .attr("width", x.bandwidth() / 2)
        .attr("height", d => height - y(d.avgMortalityRate))
        .attr("fill", "#ef4444")
        .attr("opacity", 0.7)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 1);
          
          const tooltipContent = `
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #60A5FA;">
              🌍 ${d.continent} - Mortality Rate
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #ef4444; font-size: 14px;">●</span> 
              <span style="font-weight: 600;">Average Mortality Rate:</span> 
              <span style="color: #F1F5F9; font-weight: bold;">${(d.avgMortalityRate * 100).toFixed(1)}%</span>
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #3b82f6; font-size: 14px;">●</span> 
              <span style="font-weight: 600;">Total Cases:</span> 
              <span style="color: #F1F5F9; font-weight: bold;">${d.totalCases.toLocaleString()}</span>
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #ef4444; font-size: 14px;">●</span> 
              <span style="font-weight: 600;">Total Deaths:</span> 
              <span style="color: #F1F5F9; font-weight: bold;">${d.totalDeaths.toLocaleString()}</span>
            </div>
            <div style="font-size: 11px; color: #94A3B8; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              📊 ${d.countries} countries analyzed
            </div>
          `;

          tooltip
            .html(tooltipContent)
            .style("opacity", 1)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 0.7);
          tooltip.style("opacity", 0);
        });

      // Chart title
      svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#1F2937")
        .text("Average Recovery vs Mortality Rates by Continent");

      // Subtitle
      svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#6B7280")
        .text("Comparing pandemic outcomes across all continents");

      // Axis labels
      svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 70)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#6B7280")
        .text("Continent");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2) - margin.top)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#6B7280")
        .text("Rate (%)");

      // Legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width + margin.left + 20}, ${margin.top + 20})`);

      legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#10b981")
        .attr("opacity", 0.7);

      legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "12px")
        .text("Recovery Rate");

      legend.append("rect")
        .attr("x", 0)
        .attr("y", 25)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.7);

      legend.append("text")
        .attr("x", 20)
        .attr("y", 37)
        .style("font-size", "12px")
        .text("Mortality Rate");
    }

  }, [data, selectedContinent, viewMode]);

  const continents = Array.from(new Set(data.map(d => d.Continent).filter(Boolean)));

  // Calculate statistics for insights
  const cleanedData = data
    .filter(d => d.TotalCases > 0 && d.TotalDeaths >= 0 && d.TotalRecovered >= 0)
    .map(d => ({
      country: d["Country"] || d["Country/Region"],
      continent: d.Continent || 'Unknown',
      totalCases: +d.TotalCases,
      totalDeaths: +d.TotalDeaths,
      totalRecovered: +d.TotalRecovered,
      mortalityRate: +d.TotalDeaths / +d.TotalCases,
      recoveryRate: +d.TotalRecovered / +d.TotalCases,
      cfr: (+d.TotalDeaths / +d.TotalCases) * 100,
    }))
    .filter(d => d.mortalityRate >= 0 && d.recoveryRate >= 0);

  const avgRecoveryRate = d3.mean(cleanedData, d => d.recoveryRate) * 100;
  const avgMortalityRate = d3.mean(cleanedData, d => d.mortalityRate) * 100;
  const totalGlobalCases = d3.sum(cleanedData, d => d.totalCases);
  const totalGlobalRecovered = d3.sum(cleanedData, d => d.totalRecovered);
  const totalGlobalDeaths = d3.sum(cleanedData, d => d.totalDeaths);
  const globalRecoveryRate = (totalGlobalRecovered / totalGlobalCases) * 100;
  const globalMortalityRate = (totalGlobalDeaths / totalGlobalCases) * 100;

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Mode:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="viewMode"
                  checked={viewMode === "scatter"}
                  onChange={() => setViewMode("scatter")}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">Scatter Plot</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="viewMode"
                  checked={viewMode === "bar"}
                  onChange={() => {
                    setViewMode("bar");
                    setSelectedContinent("All");
                  }}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">Continental Comparison</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Continent:
            </label>
            <select 
              value={selectedContinent} 
              onChange={e => setSelectedContinent(e.target.value)}
              disabled={viewMode === "bar"}
              className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                viewMode === "bar" ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
              }`}
            >
              <option value="All">All Continents</option>
              {continents.map(cont => (
                <option key={cont} value={cont}>{cont}</option>
              ))}
            </select>
            {viewMode === "bar" && (
              <p className="text-xs text-gray-500 mt-1">
                Continental comparison shows all continents
              </p>
            )}
          </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{globalRecoveryRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Global Recovery Rate</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{globalMortalityRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Global Mortality Rate</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{totalGlobalRecovered.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Recovered</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{(totalGlobalCases - totalGlobalRecovered - totalGlobalDeaths).toLocaleString()}</div>
            <div className="text-sm text-gray-600">Active Cases</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <svg ref={svgRef}></svg>
      </div>
      
      {/* Enhanced Insights */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">📊 Recovery & Mortality Analysis Insights:</h4>
        <div className="text-sm text-blue-800 space-y-2">
          {viewMode === "scatter" ? (
            <>
              <p>• <strong>Bubble Size:</strong> Represents total cases - larger bubbles indicate countries with higher case counts</p>
              <p>• <strong>Trend Analysis:</strong> The dashed red line shows the general relationship between recovery and mortality rates</p>
              <p>• <strong>Optimal Quadrant:</strong> Countries in the top-right area have high recovery rates with low mortality rates</p>
              <p>• <strong>Global Average:</strong> Recovery rate is {avgRecoveryRate.toFixed(1)}%, mortality rate is {avgMortalityRate.toFixed(1)}%</p>
            </>
          ) : (
            <>
              <p>• <strong>Continental Comparison:</strong> Green bars show recovery rates, red bars show mortality rates by continent</p>
              <p>• <strong>Performance Metrics:</strong> Compare how different continents handled the pandemic outcomes</p>
              <p>• <strong>Healthcare Systems:</strong> Variations may reflect differences in healthcare infrastructure and response strategies</p>
            </>
          )}
          <p>• <strong>Recovery Efficiency:</strong> The global recovery rate of {globalRecoveryRate.toFixed(1)}% shows the overall pandemic outcome resolution</p>
          <p>• <strong>Case Resolution:</strong> {((totalGlobalRecovered + totalGlobalDeaths) / totalGlobalCases * 100).toFixed(1)}% of all cases have been resolved (recovered or deceased)</p>
        </div>
      </div>
    </div>
  );
};

export default MortalityRecoveryScatterPlot;
