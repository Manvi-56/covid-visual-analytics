// src/components/data2/page1/PieChart.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PieChart = ({ data, isModal = false }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  const parseValue = (value) => {
    if (typeof value === 'string') {
      return parseFloat(value.replace(/,/g, '')) || 0;
    }
    return value || 0;
  };

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Process data
    const processedData = data.map(d => ({
      label: d.Continent || d.Region || 'Unknown',
      value: parseValue(d.TotalCases || d.Cases || 0),
      deaths: parseValue(d.TotalDeaths || d.Deaths || 0),
      recovered: parseValue(d.TotalRecovered || d.Recovered || 0)
    }));

    // Filter out zero values and group by continent
    const grouped = d3.rollups(
      processedData.filter(d => d.value > 0),
      v => ({
        cases: d3.sum(v, d => d.value),
        deaths: d3.sum(v, d => d.deaths),
        recovered: d3.sum(v, d => d.recovered)
      }),
      d => d.label
    ).map(([label, values]) => ({ label, ...values }));

    if (grouped.length === 0) return;

    // Auto-fit dimensions
    const size = isModal ? 
      Math.min(800, 700) : 
      Math.min(containerRef.current?.clientWidth || 400, 400);
    
    const radius = Math.min(size, isModal ? 700 : 400) / 2 - 60;
    const width = size;
    const height = size;

    // Set SVG dimensions
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "100%")
      .style("max-width", "100%")
      .style("max-height", "100%");

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(grouped.map(d => d.label))
      .range(d3.schemeSet3);

    // Create pie layout
    const pie = d3.pie()
      .value(d => d.cases)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const outerArc = d3.arc()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1);

    // Create tooltip
    const tooltip = d3.select("body")
      .selectAll(".pie-chart-tooltip")
      .data([null])
      .join("div")
      .attr("class", "pie-chart-tooltip")
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

    // Create arcs
    const arcs = g.selectAll(".arc")
      .data(pie(grouped))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => colorScale(d.data.label))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        // Enhance the slice
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(radius + 10)
          );

        // Calculate percentages and insights
        const total = d3.sum(grouped, d => d.cases);
        const percentage = ((d.data.cases / total) * 100).toFixed(1);
        const fatalityRate = ((d.data.deaths / d.data.cases) * 100).toFixed(2);
        const recoveryRate = ((d.data.recovered / d.data.cases) * 100).toFixed(2);

        // Enhanced tooltip content
        const tooltipContent = `
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #60A5FA;">
            ${d.data.label}
          </div>
          <div style="margin-bottom: 6px;">
            <span style="color: ${colorScale(d.data.label)}; font-size: 16px;">●</span> 
            <span style="font-weight: 600;">Cases:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${d.data.cases.toLocaleString()}</span>
          </div>
          <div style="font-size: 12px; color: #CBD5E1; margin-bottom: 4px;">
            ${percentage}% of global cases
          </div>
          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 2px;">
            Deaths: ${d.data.deaths.toLocaleString()} (${fatalityRate}%)
          </div>
          <div style="font-size: 11px; color: #94A3B8;">
            Recovered: ${d.data.recovered.toLocaleString()} (${recoveryRate}%)
          </div>
        `;

        tooltip
          .html(tooltipContent)
          .style("opacity", 1)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc);

        tooltip.style("opacity", 0);
      });

    // Add labels
    const text = g.selectAll(".label")
      .data(pie(grouped))
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("transform", d => `translate(${outerArc.centroid(d)})`)
      .style("text-anchor", d => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? 'start' : 'end';
      })
      .style("font-size", isModal ? "12px" : "10px")
      .style("fill", "#374151")
      .style("font-weight", "500")
      .text(d => {
        const total = d3.sum(grouped, d => d.cases);
        const percentage = ((d.data.cases / total) * 100).toFixed(1);
        return `${d.data.label} (${percentage}%)`;
      });

    // Add connecting lines
    const polyline = g.selectAll(".polyline")
      .data(pie(grouped))
      .enter()
      .append("polyline")
      .attr("class", "polyline")
      .attr("stroke", "#6B7280")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("points", d => {
        const pos = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.95 * (midAngle < Math.PI ? 1 : -1);
        return [arc.centroid(d), outerArc.centroid(d), pos];
      });

    // Chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", isModal ? "18px" : "16px")
      .style("font-weight", "bold")
      .style("fill", "#1F2937")
      .text("COVID-19 Cases Distribution");

  }, [data, isModal]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full ${isModal ? 'h-full' : 'h-96'} ${isModal ? '' : 'flex items-center justify-center'} overflow-hidden`}
      style={{ 
        minHeight: isModal ? '600px' : '400px',
        maxHeight: isModal ? 'none' : '400px'
      }}
    >
      <svg 
        ref={svgRef} 
        className="w-full h-[600px]"
        style={{ 
          display: 'block',
          minHeight: isModal ? '600px' : '400px'
        }}
      />
    </div>
  );
};

export default PieChart;
