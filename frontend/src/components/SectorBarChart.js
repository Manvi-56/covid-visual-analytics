import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const SectorBarChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 500, height = 300, margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const stressLevels = ["Low", "Medium", "High"];
    const sectors = Array.from(new Set(data.map(d => d.Sector)));

    const nested = d3.rollup(
      data,
      v => d3.rollup(v, g => g.length, d => d.Stress_Level),
      d => d.Sector
    );

    const stackData = sectors.map(sector => {
      const values = nested.get(sector) || new Map();
      return {
        sector,
        Low: values.get("Low") || 0,
        Medium: values.get("Medium") || 0,
        High: values.get("High") || 0
      };
    });

    const x = d3.scaleBand().domain(sectors).range([margin.left, width - margin.right]).padding(0.3);
    const y = d3.scaleLinear().domain([0, d3.max(stackData, d => d.Low + d.Medium + d.High)]).nice().range([height - margin.bottom, margin.top]);
    const color = d3.scaleOrdinal().domain(stressLevels).range(d3.schemeSet2);

    const group = svg.attr("width", width).attr("height", height)
      .append("g");

    group.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    group.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    const stack = d3.stack().keys(stressLevels);
    const series = stack(stackData);

    group.selectAll("g.layer")
      .data(series)
      .join("g")
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", d => x(d.data.sector))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());

  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default SectorBarChart;
