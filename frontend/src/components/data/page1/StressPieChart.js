import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const StressPieChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Get the container dimensions
    const containerWidth = svgRef.current.clientWidth || 300;
    const containerHeight = svgRef.current.clientHeight || 300;
    
    const width = Math.min(containerWidth, 300);
    const height = Math.min(containerHeight, 300);
    const radius = Math.min(width, height) / 2 - 20; // Add some padding

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

    // Create tooltip with PieChart style
    const tooltip = d3.select("body")
      .selectAll(".stress-pie-tooltip")
      .data([null])
      .join("div")
      .attr("class", "stress-pie-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(15, 23, 42, 0.95)")
      .style("color", "white")
      .style("padding", "12px 16px")
      .style("border-radius", "8px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("box-shadow", "0 10px 25px rgba(0, 0, 0, 0.3)")
      .style("backdrop-filter", "blur(10px)")
      .style("border", "1px solid rgba(255, 255, 255, 0.1)")
      .style("z-index", "9999")
      .style("transition", "opacity 0.2s ease");

    const arcs = g.selectAll("arc")
      .data(pieData)
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data[0]))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        // Enhance the slice
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(radius + 5)
          );

        const percent = ((d.data[1] / total) * 100).toFixed(1);
        
        // Enhanced tooltip content
        const tooltipContent = `
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #60A5FA;">
            ${d.data[0]} Stress Level
          </div>
          <div style="margin-bottom: 6px;">
            <span style="color: ${color(d.data[0])}; font-size: 16px;">●</span> 
            <span style="font-weight: 600;">Count:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${d.data[1].toLocaleString()}</span>
          </div>
          <div style="font-size: 12px; color: #CBD5E1; margin-bottom: 4px;">
            ${percent}% of total employees
          </div>
          <div style="font-size: 11px; color: #94A3B8;">
            Distribution shows workplace stress patterns
          </div>
        `;

        tooltip
          .html(tooltipContent)
          .style("opacity", 1)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc);

        tooltip.style("opacity", 0);
      });

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
    <div className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default StressPieChart;
