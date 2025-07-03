import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const MeetingsProductivityChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Define bin size (group meetings per day into bins of 1)
    const binSize = 1;

    // Group into bins like "0-1", "1-2", "2-3", etc.
    const binned = d3.rollups(
      data,
      v => d3.mean(v, d => +d.Productivity_Change),
      d => {
        const m = +d.Meetings_Per_Day;
        if (isNaN(m)) return "Unknown";
        const bin = Math.floor(m / binSize) * binSize;
        return `${bin}-${bin + binSize}`;
      }
    );

    const chartData = binned
      .filter(([bin, val]) => val !== undefined && !isNaN(val))
      .sort((a, b) => {
        const aStart = parseFloat(a[0].split("-")[0]);
        const bStart = parseFloat(b[0].split("-")[0]);
        return aStart - bStart;
      })
      .map(([range, prod]) => ({ range, prod }));

    const width = 600, height = 300, margin = { top: 20, right: 30, bottom: 50, left: 50 };

    const x = d3.scaleBand()
      .domain(chartData.map(d => d.range))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);

    svg.attr("width", width).attr("height", height);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.selectAll("rect")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.range))
      .attr("y", d => y(d.prod))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.prod))
      .attr("fill", "steelblue");
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default MeetingsProductivityChart;
