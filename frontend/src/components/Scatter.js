import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const MortalityRecoveryScatterPlot = ({ data }) => {
  const svgRef = useRef();
  const [selectedContinent, setSelectedContinent] = useState("All");

  const margin = { top: 60, right: 30, bottom: 80, left: 70 },
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  useEffect(() => {
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
        continent: d.Continent,
        mortalityRate: +d.TotalDeaths / +d.TotalCases,
        recoveryRate: +d.TotalRecovered / +d.TotalCases,
      }))
      .filter(d => d.mortalityRate >= 0 && d.recoveryRate >= 0 && (!selectedContinent || selectedContinent === "All" || d.continent === selectedContinent));

    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format(".0%")));

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "6px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("display", "none");

    g.selectAll("circle")
      .data(cleanedData)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.recoveryRate))
      .attr("cy", d => y(d.mortalityRate))
      .attr("r", 5)
      .attr("fill", d => color(d.continent))
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(`<strong>${d.country}</strong><br/>Recovery: ${(d.recoveryRate * 100).toFixed(1)}%<br/>Mortality: ${(d.mortalityRate * 100).toFixed(1)}%`);
        d3.select(event.currentTarget).attr("stroke", "black").attr("stroke-width", 1.5);
      })
      .on("mousemove", event => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", event => {
        tooltip.style("display", "none");
        d3.select(event.currentTarget).attr("stroke", null);
      });

    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Mortality vs Recovery Rate by Country");

    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 50)
      .attr("text-anchor", "middle")
      .text("Recovery Rate");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2 - margin.top)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Mortality Rate");
  }, [data, selectedContinent]);

  const continents = Array.from(new Set(data.map(d => d.Continent).filter(Boolean)));

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <label>Filter by Continent: </label>
        <select value={selectedContinent} onChange={e => setSelectedContinent(e.target.value)}>
          <option value="All">All</option>
          {continents.map(cont => (
            <option key={cont} value={cont}>{cont}</option>
          ))}
        </select>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default MortalityRecoveryScatterPlot;
