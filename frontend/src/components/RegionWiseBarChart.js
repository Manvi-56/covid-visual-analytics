import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const GroupedBarChart = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

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

    // Normalize WHO Region names
   // Normalize WHO Region names (handles all known region variations)
const normalizeRegion = (region) => {
  if (!region || typeof region !== "string") return "Other"; // Safe fallback
  const trimmed = region.trim();
  const map = {
    "EasternMediterranean": "Eastern Mediterranean",
    "Eastern Mediterranean": "Eastern Mediterranean",
    "South-EastAsia": "South-East Asia",
    "South-East Asia": "South-East Asia",
    "WesternPacific": "Western Pacific",
    "Western Pacific": "Western Pacific",
    "Europe": "Europe",
    "Africa": "Africa",
    "Americas": "Americas"
  };
  return map[trimmed] || "Other";
};



    const cleanedData = data.map(d => ({
      region: normalizeRegion(d["WHO Region"]),
      cases: +d.TotalCases,
      deaths: +d.TotalDeaths,
      recovered: +d.TotalRecovered
    }));

    const grouped = d3.rollups(
      cleanedData,
      v => ({
        cases: d3.sum(v, d => d.cases),
        deaths: d3.sum(v, d => d.deaths),
        recovered: d3.sum(v, d => d.recovered),
      }),
      d => d.region
    );

    const regions = grouped.map(([key]) => key);
    const subgroups = ["cases", "deaths", "recovered"];

    const x0 = d3.scaleBand().domain(regions).range([0, width]).padding(0.2);
    const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(0.05);
    const y = d3.scaleLinear()
      .domain([0, d3.max(grouped, ([, v]) => Math.max(v.cases, v.deaths, v.recovered)) * 1.1])
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(["#1f77b4", "#d62728", "#2ca02c"]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    g.append("g").call(d3.axisLeft(y));

    // Tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("padding", "6px")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("display", "none");

    const bars = g.selectAll("g.bar-group")
      .data(grouped)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d[0])},0)`);

    bars.selectAll("rect")
      .data(d => subgroups.map(key => ({ key, value: d[1][key], region: d[0] })))
      .enter()
      .append("rect")
      .attr("x", d => x1(d.key))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.key))
      .on("mouseover", (event, d) => {
        tooltip
          .html(`<strong>${d.region}</strong><br/>${d.key}: ${d.value.toLocaleString()}`)
          .style("display", "block");
        d3.select(event.currentTarget).attr("opacity", 0.7);
      })
      .on("mousemove", event => {
        tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", event => {
        tooltip.style("display", "none");
        d3.select(event.currentTarget).attr("opacity", 1);
      });

    // Title and labels
    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("COVID-19 Region-wise Cases, Deaths & Recoveries");

    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 60)
      .attr("text-anchor", "middle")
      .text("WHO Region");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2 - margin.top)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Count");

  }, [data]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </div>
  );
};

export default GroupedBarChart;