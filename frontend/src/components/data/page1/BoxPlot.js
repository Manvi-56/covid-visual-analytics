import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const SectorHoursBarChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 50, right: 30, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const groupedData = d3.rollups(
      data,
      v => d3.mean(v, d => +d.Hours_Worked_Per_Day),
      d => d.Sector
    );

    const x = d3
      .scaleBand()
      .domain(groupedData.map(d => d[0]))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(groupedData, d => d[1]) * 1.1])
      .range([height, 0]);

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Axes
    chart.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    chart.append("g").call(d3.axisLeft(y));

    // Bars
    chart
      .selectAll("rect")
      .data(groupedData)
      .enter()
      .append("rect")
      .attr("x", d => x(d[0]))
      .attr("y", d => y(d[1]))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d[1]))
      .attr("fill", "blue");

    // Labels
    chart
      .selectAll("text.label")
      .data(groupedData)
      .enter()
      .append("text")
      .attr("x", d => x(d[0]) + x.bandwidth() / 2)
      .attr("y", d => y(d[1]) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(d => d[1].toExponential(2));

    // Title
    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Hours Worked Per Day by Sector");

    // Axis labels
    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 45)
      .attr("text-anchor", "middle")
      .text("Sector");

    svg
      .append("text")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2 - margin.top)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Hours Worked Per Day");
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default SectorHoursBarChart;