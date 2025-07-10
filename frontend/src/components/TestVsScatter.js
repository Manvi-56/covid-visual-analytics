import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const CovidScatterPlot = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [continentFilter, setContinentFilter] = useState("All");
  const [insight, setInsight] = useState("");

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 60, right: 40, bottom: 70, left: 80 };
    const width = 800 - margin.left - margin.right;
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
    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "8px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("display", "none");

    svgG.selectAll("circle")
      .data(filtered)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.TotalTests))
      .attr("cy", d => y(d.TotalCases))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .on("mouseover", function (event, d) {
        tooltip
          .html(`<strong>${d["Country/Region"]}</strong><br>Total Tests: ${d.TotalTests.toLocaleString()}<br>Total Cases: ${d.TotalCases.toLocaleString()}`)
          .style("display", "block");
        d3.select(this).attr("fill", "darkorange");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("display", "none");
        d3.select(this).attr("fill", "steelblue");
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
      .text("Total Tests vs Total Cases (Log-Log)");

    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 50)
      .attr("text-anchor", "middle")
      .text("Total Tests");

    svg.append("text")
      .attr("transform", `translate(15,${height / 2 + margin.top}) rotate(-90)`)
      .attr("text-anchor", "middle")
      .text("Total Cases");

    setInsight(`🔍 Strong positive correlation observed. Slope ≈ ${slope.toFixed(2)}, indicating exponential trend.`);
  }, [data, continentFilter]);

  const continents = Array.from(new Set(data.map(d => d.Continent))).filter(Boolean);

  return (
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
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
      <div style={{ marginTop: "12px", fontStyle: "italic" }}>{insight}</div>
    </div>
  );
};

export default CovidScatterPlot;
