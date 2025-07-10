import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const ContinentPieChart = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [metric, setMetric] = useState("TotalDeaths");

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2 +10})`);

    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "6px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("display", "none");

   const color = d3.scaleOrdinal()
  .domain(["Asia", "Europe", "Africa", "North America", "South America", "Oceania"])
  .range(["#720d42", "#000053", "#307085", "#d62728", "#9467bd", "#8c564b"]);

  const groupedData = d3
  .rollups(
    data,
    (v) => d3.sum(v, (d) => +d[metric]),
    (d) => d.Continent
  )
  .filter(
    ([continent]) =>
      continent && 
      continent !== "" && 
      continent !== "Oceania" && 
      continent !== "Australia/Oceania"
  );

    const pie = d3.pie().value((d) => d[1]);
    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius - 10);
    const labelArc = d3
      .arc()
      .innerRadius(radius * 0.65)
      .outerRadius(radius * 0.65);

    const arcs = g
      .selectAll("g.arc")
      .data(pie(groupedData))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data[0]))
      .on("mouseover", (event, d) => {
        const total = d3.sum(groupedData, (x) => x[1]);
        const percent = ((d.data[1] / total) * 100).toFixed(2);
        tooltip
          .html(
            `<strong>${d.data[0]}</strong><br/>
           ${metric.replace("Total", "")}: ${d.data[1].toLocaleString()}<br/>
           (${percent}%)`
          )
          .style("display", "block");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", (event) => {
        tooltip.style("display", "none");
        d3.select(event.currentTarget).attr("opacity", 1);
      });

    arcs
      .append("text")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#fff")
      .text((d) => d.data[0]);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text(`${metric.replace("Total", "")} by Continent`);
  }, [data, metric]);

  return (
    <div>
      <div className="filter-pie">
        <label>Select Metric: </label>
        <select value={metric} onChange={(e) => setMetric(e.target.value)}>
          <option value="TotalDeaths">Total Deaths</option>
          <option value="TotalCases">Total Cases</option>
          <option value="TotalRecovered">Total Recovered</option>
          <option value="Population">Population</option>
        </select>
      </div>
      <div className="image-pie">
        <svg ref={svgRef}></svg>
        <div ref={tooltipRef}></div>
      </div>
    </div>
  );
};

export default ContinentPieChart;
