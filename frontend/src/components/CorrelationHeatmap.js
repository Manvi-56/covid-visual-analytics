import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const CorrelationHeatmap = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const numericKeys = Object.keys(data[0]).filter(k => !isNaN(data[0][k]));
    const matrix = numericKeys.map(x =>
      numericKeys.map(y => {
        const xVals = data.map(d => +d[x]);
        const yVals = data.map(d => +d[y]);
        const corr = d3.correlation(xVals, yVals);
        return { x, y, value: corr };
      })
    );

    const width = 400, height = 400, cellSize = 40;

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    const x = d3.scaleBand().domain(numericKeys).range([0, numericKeys.length * cellSize]);
    const y = d3.scaleBand().domain(numericKeys).range([0, numericKeys.length * cellSize]);

    const color = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]);

    svg.selectAll("rect")
      .data(matrix.flat())
      .join("rect")
      .attr("x", d => x(d.x))
      .attr("y", d => y(d.y))
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", d => color(d.value));

    svg.selectAll("text")
      .data(matrix.flat())
      .join("text")
      .attr("x", d => x(d.x) + 20)
      .attr("y", d => y(d.y) + 25)
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .text(d => d.value.toFixed(2));

  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default CorrelationHeatmap;
