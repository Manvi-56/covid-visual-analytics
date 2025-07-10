import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const TestsPerMillionLineChart = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [continent, setContinent] = useState("All");

  const continents = Array.from(new Set(data.map(d => d.Continent).filter(Boolean)));

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 50, right: 30, bottom: 160, left: 70 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "6px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("display", "none");

    // Clean and prepare data
    const cleaned = data
      .map(d => ({
        country: d["Country"] || d["Country/Region"],
        testsPerMillion: +d["TestsPerMillion"] || +d["Tests/1M pop"],
        continent: d.Continent
      }))
      .filter(d => d.country && !isNaN(d.testsPerMillion) && (continent === "All" || d.continent === continent));

    const x = d3.scaleBand()
      .domain(cleaned.map(d => d.country))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(cleaned, d => d.testsPerMillion) * 1.1])
      .range([height, 0]);

    // Y-axis with grid
    g.append("g")
      .call(d3.axisLeft(y).ticks(10).tickFormat(d3.format(",")).tickSize(-width))
      .selectAll("line")
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "2,2");

    g.selectAll("path.domain").remove();

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -5)
      .attr("y", x.bandwidth() / 2)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .style("font-size", "8px");

    // Lines and circles
    g.selectAll("line.spike")
      .data(cleaned)
      .enter()
      .append("line")
      .attr("x1", d => x(d.country) + x.bandwidth() / 2)
      .attr("x2", d => x(d.country) + x.bandwidth() / 2)
      .attr("y1", height)
      .attr("y2", d => y(d.testsPerMillion))
      .attr("stroke", "#007acc")
      .attr("stroke-width", 2);

    g.selectAll("circle")
      .data(cleaned)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.country) + x.bandwidth() / 2)
      .attr("cy", d => y(d.testsPerMillion))
      .attr("r", 3)
      .attr("fill", "#007acc")
      .on("mouseover", (event, d) => {
        tooltip
          .html(`<strong>${d.country}</strong><br/>Tests/1M: ${d.testsPerMillion.toLocaleString()}`)
          .style("display", "block");
        d3.select(event.currentTarget).attr("fill", "#005b99");
      })
      .on("mousemove", event => {
        tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", event => {
        tooltip.style("display", "none");
        d3.select(event.currentTarget).attr("fill", "#007acc");
      });

    // Title and axis labels
    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Tests Per Million by Country");

    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 110)
      .attr("text-anchor", "middle")
      .text("Country/Region");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2) - margin.top)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Tests/1M pop");
  }, [data, continent]);

  return (
    <div>
      <div className="filter-pie">
      <label htmlFor="continent-select">Filter by Continent: </label>
      <select
        id="continent-select"
        onChange={e => setContinent(e.target.value)}
        value={continent}
        style={{ marginBottom: "10px" }}
      >
        <option value="All">All</option>
        {continents.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      </div>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </div>
  );
};

export default TestsPerMillionLineChart;
