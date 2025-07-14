import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const EmploymentWorldMap = ({ data, onCountrySelect, selectedCountry }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr("width", width).attr("height", height);

    // Create a map of country data
    const dataMap = new Map();
    data.forEach(d => {
      dataMap.set(d.country, d);
    });

    // Color scale for employment impact
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(data, d => d.impactPercentage || 0)])
      .interpolator(d3.interpolateReds);

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "employment-tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", 1000);

    // Simple world map visualization using circles for countries
    const simulation = d3.forceSimulation(data)
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => Math.sqrt((d.totalEmployment || 0) / 100) + 5))
      .force("charge", d3.forceManyBody().strength(-50));

    const circles = svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", d => Math.max(3, Math.sqrt((d.totalEmployment || 0) / 1000) + 2))
      .attr("fill", d => colorScale(d.impactPercentage || 0))
      .attr("stroke", d => selectedCountry && selectedCountry.country === d.country ? "#2c3e50" : "#fff")
      .attr("stroke-width", d => selectedCountry && selectedCountry.country === d.country ? 3 : 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke", "#2c3e50")
          .attr("stroke-width", 2);
        
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`
          <strong>${d.country}</strong><br/>
          Hours Lost: ${(d.impactPercentage || 0).toFixed(1)}%<br/>
          Impact Level: ${d.impactLevel || 'Unknown'}<br/>
          Male Employment: ${(d.maleEmployment || 0).toFixed(0)}K<br/>
          Female Employment: ${(d.femaleEmployment || 0).toFixed(0)}K<br/>
          Region: ${d.region || 'Unknown'}<br/>
          Total Employed: ${((d.totalEmployment || 0) / 1000).toFixed(1)}M
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(event, d) {
        if (!selectedCountry || selectedCountry.country !== d.country) {
          d3.select(this)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);
        }
        
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .on("click", function(event, d) {
        onCountrySelect(d);
      });

    simulation.on("tick", () => {
      circles
        .attr("cx", d => Math.max(20, Math.min(width - 20, d.x)))
        .attr("cy", d => Math.max(20, Math.min(height - 20, d.y)));
    });

    // Add legend
    const legendWidth = 200;
    const legendHeight = 10;
    const legend = svg.append("g")
      .attr("transform", `translate(${width - legendWidth - 50}, ${height - 50})`);

    // Create gradient for legend
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "employment-legend-gradient");

    gradient.selectAll("stop")
      .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#employment-legend-gradient)");

    // Legend scale
    const legendScale = d3.scaleLinear()
      .domain(colorScale.domain())
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d => `${d.toFixed(1)}%`);

    legend.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .style("font-size", "10px");

    legend.append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("% Working Hours Lost");

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("Global Employment Impact Distribution");

    // Add instructions
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#7f8c8d")
      .text("Circle size represents total employment • Click countries for details • Hover for info");

    // Cleanup function
    return () => {
      tooltip.remove();
    };

  }, [data, selectedCountry, onCountrySelect]);

  return (
    <div className="chart-container world-map">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default EmploymentWorldMap;
