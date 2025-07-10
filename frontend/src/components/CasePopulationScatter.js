import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const PopulationVsCasesScatter = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 50, right: 30, bottom: 70, left: 70 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const cleaned = data
      .map(d => ({
        country: d["Country"],
        population: +d["Population"],
        totalCases: +d["TotalCases"],
        continent: d["Continent"] || d["WHORegion"],
      }))
      .filter(d => d.country && !isNaN(d.population) && !isNaN(d.totalCases));

    const x = d3.scaleLog()
      .domain([d3.min(cleaned, d => d.population || 1), d3.max(cleaned, d => d.population)])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(cleaned, d => d.totalCases) * 1.1])
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "6px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("display", "none");

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(10, "~s"));

    g.append("g").call(d3.axisLeft(y));

    g.selectAll("circle")
      .data(cleaned)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.population))
      .attr("cy", d => y(d.totalCases))
      .attr("r", 6)
      .attr("fill", d => color(d.continent))
      .attr("opacity", 0.7)
      .on("mouseover", (event, d) => {
        tooltip
          .html(`<strong>${d.country}</strong><br/>Population: ${d.population.toLocaleString()}<br/>Total Cases: ${d.totalCases.toLocaleString()}`)
          .style("display", "block");
      })
      .on("mousemove", event => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Total COVID-19 Cases vs Population by Country");

    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 60)
      .attr("text-anchor", "middle")
      .text("Population");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2) - margin.top)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Total Cases");
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default PopulationVsCasesScatter;
