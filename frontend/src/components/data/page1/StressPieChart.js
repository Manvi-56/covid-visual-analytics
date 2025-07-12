import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const StressPieChart = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const stressCounts = d3.rollup(
      data,
      v => v.length,
      d => d.Stress_Level
    );

    const total = d3.sum([...stressCounts.values()]);
    const pieData = d3.pie().value(d => d[1])(Array.from(stressCounts));

    const color = d3.scaleOrdinal()
      .domain(stressCounts.keys())
      .range(["#FF6B6B", "#4ECDC4", "#5567FF"]); // red, teal, blue

    const arc = d3.arc().innerRadius(0).outerRadius(radius - 10);
    const labelArc = d3.arc().innerRadius(radius / 2).outerRadius(radius - 30);

    svg.attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "8px 12px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
      .style("pointer-events", "none")
      .style("display", "none");

    const arcs = g.selectAll("arc")
      .data(pieData)
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data[0]))
      .on("mouseover", function (event, d) {
        const percent = ((d.data[1] / total) * 100).toFixed(1);
        tooltip
          .style("display", "block")
          .html(`<strong>${d.data[0]}</strong><br/>Count: ${d.data[1]}<br/>${percent}%`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY + 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", () => tooltip.style("display", "none"));

    // Labels
    arcs.append("text")
      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(d => {
        const percent = ((d.data[1] / total) * 100).toFixed(1);
        return `${d.data[0]} (${percent}%)`;
      });

  }, [data]);

  return (
    <>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </>
  );
};

export default StressPieChart;
