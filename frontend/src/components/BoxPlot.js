import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const BoxPlot = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 500, height = 300, margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const sectors = Array.from(new Set(data.map(d => d.Sector)));
    const grouped = d3.group(data, d => d.Sector);

    const stats = Array.from(grouped, ([sector, values]) => {
      const hours = values.map(d => +d.Hours_Worked_Per_Day).sort(d3.ascending);
      const q1 = d3.quantile(hours, 0.25);
      const q2 = d3.median(hours);
      const q3 = d3.quantile(hours, 0.75);
      const min = d3.min(hours);
      const max = d3.max(hours);
      return { sector, q1, q2, q3, min, max };
    });

    const x = d3.scaleBand().domain(sectors).range([margin.left, width - margin.right]).padding(0.4);
    const y = d3.scaleLinear().domain([0, d3.max(stats, d => d.max)]).nice().range([height - margin.bottom, margin.top]);

    svg.attr("width", width).attr("height", height);

    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));

    const boxWidth = x.bandwidth();

    svg.selectAll("g.box")
      .data(stats)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x(d.sector)},0)`)
      .call(g => {
        g.append("line")
          .attr("y1", d => y(d.min))
          .attr("y2", d => y(d.max))
          .attr("x1", boxWidth / 2)
          .attr("x2", boxWidth / 2)
          .attr("stroke", "#000");

        g.append("rect")
          .attr("y", d => y(d.q3))
          .attr("height", d => y(d.q1) - y(d.q3))
          .attr("width", boxWidth)
          .attr("fill", "#69b3a2");

        g.append("line")
          .attr("x1", 0)
          .attr("x2", boxWidth)
          .attr("y1", d => y(d.q2))
          .attr("y2", d => y(d.q2))
          .attr("stroke", "black");
      });
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default BoxPlot;
