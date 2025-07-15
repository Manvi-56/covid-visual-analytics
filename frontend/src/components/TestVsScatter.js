import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const CovidScatterPlot = ({ data }) => {
  const svgRef = useRef();
  const [continentFilter, setContinentFilter] = useState("All");
  const [insight, setInsight] = useState("");

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 60, right: 180, bottom: 70, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const filtered = data.filter(
      d => d.TotalTests > 0 && d.TotalCases > 0 && (continentFilter === "All" || d.Continent === continentFilter)
    );

    const svgG = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLog()
      .domain(d3.extent(filtered, d => d.TotalTests))
      .range([0, width])
      .nice();

    const y = d3.scaleLog()
      .domain(d3.extent(filtered, d => d.TotalCases))
      .range([height, 0])
      .nice();

    const xAxis = d3.axisBottom(x).ticks(10, ".2s");
    const yAxis = d3.axisLeft(y).ticks(10, ".2s");

    svgG.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    svgG.append("g")
      .call(yAxis);

    // Tooltip
    const tooltip = d3.select("body")
      .selectAll(".scatter-chart-tooltip")
      .data([null])
      .join("div")
      .attr("class", "scatter-chart-tooltip")
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
      .style("z-index", "9999")
      .style("transition", "opacity 0.2s ease");

    svgG.selectAll("circle")
      .data(filtered)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.TotalTests))
      .attr("cy", d => y(d.TotalCases))
      .attr("r", 5)
      .attr("fill", d => {
        // Color coding by continent
        const continentColors = {
          "Asia": "#3b82f6",
          "Europe": "#10b981", 
          "North America": "#f59e0b",
          "South America": "#ef4444",
          "Africa": "#8b5cf6",
          "Oceania": "#06b6d4"
        };
        return continentColors[d.Continent] || "#6b7280";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        // Calculate additional metrics
        const testsPerCase = d.TotalTests > 0 ? (d.TotalTests / d.TotalCases).toFixed(2) : 0;
        const positivityRate = d.TotalTests > 0 ? ((d.TotalCases / d.TotalTests) * 100).toFixed(2) : 0;
        const population = d.Population || 'N/A';
        const testsPerMillion = d.Population > 0 ? ((d.TotalTests / d.Population) * 1000000).toFixed(0) : 'N/A';
        
        // Get country name from various possible properties
        const countryName = d["Country/Region"] || d.Country || d.CountryRegion || d.location || d.name || 'Unknown Country';
        
        // Enhanced tooltip content matching RegionWiseBarChart style
        const tooltipContent = `
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #60A5FA;">
            🌍 ${countryName}
          </div>
          <div style="margin-bottom: 6px;">
            <span style="color: #3b82f6; font-size: 16px;">●</span> 
            <span style="font-weight: 600;">Total Tests:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${d.TotalTests.toLocaleString()}</span>
          </div>
          <div style="margin-bottom: 6px;">
            <span style="color: #ef4444; font-size: 16px;">●</span> 
            <span style="font-weight: 600;">Total Cases:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${d.TotalCases.toLocaleString()}</span>
          </div>
          <div style="margin-bottom: 6px;">
            <span style="color: #10b981; font-size: 16px;">●</span> 
            <span style="font-weight: 600;">Tests per Case:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${testsPerCase}</span>
          </div>
          <div style="font-size: 12px; color: #CBD5E1; margin-bottom: 4px;">
            Positivity Rate: ${positivityRate}%
          </div>
          ${testsPerMillion !== 'N/A' ? `
          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 4px;">
            Tests per Million: ${testsPerMillion}
          </div>` : ''}
          <div style="font-size: 11px; color: #94A3B8; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            📍 ${d.Continent || 'Unknown'}
          </div>
        `;
        
        tooltip
          .html(tooltipContent)
          .style("opacity", 1);
          
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8)
          .attr("stroke-width", 2)
          .attr("stroke", "#fff")
          .style("opacity", 0.8);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function () {
        tooltip
          .style("opacity", 0);
          
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 5)
          .attr("stroke-width", 1)
          .style("opacity", 1);
      });

    // Regression line (log-log)
    const logX = filtered.map(d => Math.log(d.TotalTests));
    const logY = filtered.map(d => Math.log(d.TotalCases));
    const n = logX.length;
    const avgX = d3.mean(logX);
    const avgY = d3.mean(logY);
    const slope = d3.sum(logX.map((x, i) => (x - avgX) * (logY[i] - avgY))) / d3.sum(logX.map(x => (x - avgX) ** 2));
    const intercept = avgY - slope * avgX;

    const regLine = d3.range(d3.min(filtered, d => d.TotalTests), d3.max(filtered, d => d.TotalTests), 10000)
      .map(xVal => ({
        x: xVal,
        y: Math.exp(intercept + slope * Math.log(xVal))
      }));

    svgG.append("path")
      .datum(regLine)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("d", d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y))
      );

    // Labels and title
    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Total Tests vs Total Cases (Log-Log Scale)");

    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 50)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Total Tests");

    svg.append("text")
      .attr("transform", `translate(15,${height / 2 + margin.top}) rotate(-90)`)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Total Cases");

    // Add color legend for continents
    const continentColors = {
      "Asia": "#3b82f6",
      "Europe": "#10b981", 
      "North America": "#f59e0b",
      "South America": "#ef4444",
      "Africa": "#8b5cf6",
      "Oceania": "#06b6d4"
    };

    const legendContainer = svg.append("g")
      .attr("transform", `translate(${width + margin.left + 20}, ${margin.top + 20})`);

    legendContainer.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Continents:");

    Object.entries(continentColors).forEach(([continent, color], i) => {
      const legendItem = legendContainer.append("g")
        .attr("transform", `translate(0, ${20 + i * 22})`);

      legendItem.append("circle")
        .attr("cx", 6)
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);

      legendItem.append("text")
        .attr("x", 16)
        .attr("y", 4)
        .style("font-size", "11px")
        .style("fill", "#333")
        .text(continent);
    });

    setInsight(`🔍 Analysis: Strong positive correlation observed (slope ≈ ${slope.toFixed(2)}). Countries with higher testing rates tend to detect more cases. Each point represents a country - hover for detailed testing metrics.`);
  }, [data, continentFilter]);

  const continents = Array.from(new Set(data.map(d => d.Continent))).filter(Boolean);

  return (
    <div>
      <div>
      <label>
        Filter by Continent:
        <select value={continentFilter} onChange={e => setContinentFilter(e.target.value)}>
          <option value="All">All</option>
          {continents.map(cont => (
            <option key={cont} value={cont}>{cont}</option>
          ))}
        </select>
      </label>
      </div>
      <svg ref={svgRef}></svg>
      <div style={{ marginTop: "12px", fontStyle: "italic" }}>{insight}</div>
    </div>
  );
};

export default CovidScatterPlot;
