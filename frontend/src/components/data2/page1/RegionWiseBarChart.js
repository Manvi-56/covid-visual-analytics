// src/components/data2/page1/RegionWiseBarChart.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RegionWiseBarChart = ({ data, isModal = false }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  const parseValue = (value) => {
    if (typeof value === 'string') {
      return parseFloat(value.replace(/,/g, '')) || 0;
    }
    return value || 0;
  };

  const normalizeRegion = (region) => {
    if (!region) return "Other";
    return region.replace(/ of the Americas?/, "").trim();
  };

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Clean and prepare data
    const cleanedData = data.map(d => ({
      region: normalizeRegion(d.WHORegion),
      cases: parseValue(d.TotalCases),
      deaths: parseValue(d.TotalDeaths),
      recovered: parseValue(d.TotalRecovered)
    }));

    const filtered = cleanedData.filter(d => d.region !== "Other");

    const grouped = d3.rollups(
      filtered,
      v => ({
        cases: d3.sum(v, d => d.cases),
        deaths: d3.sum(v, d => d.deaths),
        recovered: d3.sum(v, d => d.recovered),
      }),
      d => d.region
    );

    if (grouped.length === 0) return;

    // Calculate optimal dimensions
    const regions = grouped.map(([region]) => region);
    const subgroups = ["cases", "deaths", "recovered"];
    
    // Auto-fit container sizing
    const baseBarWidth = isModal ? 150 : 80;
    const calculatedWidth = Math.max(regions.length * baseBarWidth, isModal ? 900 : 600);
    const containerWidth = isModal 
      ? calculatedWidth
      : Math.min(calculatedWidth, containerRef.current?.clientWidth || 800);
    
    const containerHeight = isModal ? 
      Math.max(600, window.innerHeight * 0.6) : 
      400;
    const margin = { top: 60, right: 120, bottom: 100, left: 80 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Set SVG to auto-fit content
    svg
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "100%")
      .style("max-width", "100%")
      .style("max-height", "100%");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x0 = d3.scaleBand().domain(regions).range([0, width]).padding(0.2);
    const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(0.05);
    const y = d3.scaleLinear()
      .domain([0, d3.max(grouped, ([, v]) => Math.max(v.cases, v.deaths, v.recovered)) * 1.1])
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(["#3B82F6", "#EF4444", "#10B981"]);

    // Axes with better styling
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", isModal ? "12px" : "10px")
      .style("fill", "#374151");

    g.append("g")
      .call(d3.axisLeft(y).ticks(8).tickFormat(d3.format(".2s")))
      .style("font-size", isModal ? "12px" : "10px")
      .style("fill", "#374151");

    // Create tooltip
    const tooltip = d3.select("body")
      .selectAll(".region-chart-tooltip")
      .data([null])
      .join("div")
      .attr("class", "region-chart-tooltip")
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

    // Create bar groups
    const barGroups = g.selectAll(".bar-group")
      .data(grouped)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(${x0(d[0])},0)`);

    // Create bars with enhanced tooltips
    barGroups.selectAll("rect")
      .data(d => subgroups.map(key => ({ 
        key, 
        value: d[1][key], 
        region: d[0],
        total: Object.values(d[1]).reduce((a, b) => a + b, 0)
      })))
      .enter()
      .append("rect")
      .attr("x", d => x1(d.key))
      .attr("y", height)
      .attr("width", x1.bandwidth())
      .attr("height", 0)
      .attr("fill", d => color(d.key))
      .attr("rx", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        // Enhanced bar highlight
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.8)
          .style("stroke", "#fff")
          .style("stroke-width", "2px");

        // Calculate percentage and format data
        const percentage = ((d.value / d.total) * 100).toFixed(1);
        const categoryName = d.key.charAt(0).toUpperCase() + d.key.slice(1);
        
        // Calculate case fatality rate for deaths
        const regionData = grouped.find(g => g[0] === d.region)[1];
        const fatalityRate = d.key === 'deaths' ? ((d.value / regionData.cases) * 100).toFixed(2) : 0;
        const recoveryRate = d.key === 'recovered' ? ((d.value / regionData.cases) * 100).toFixed(2) : 0;
        
        // Enhanced tooltip content with data insights
        const tooltipContent = `
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #60A5FA;">
            ${d.region}
          </div>
          <div style="margin-bottom: 6px;">
            <span style="color: ${color(d.key)}; font-size: 16px;">●</span> 
            <span style="font-weight: 600;">${categoryName}:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${d.value.toLocaleString()}</span>
          </div>
          <div style="font-size: 12px; color: #CBD5E1; margin-bottom: 4px;">
            ${percentage}% of total regional impact
          </div>
          <div style="font-size: 11px; color: #94A3B8;">
            Total cases: ${d.total.toLocaleString()}
          </div>
          ${d.key === 'deaths' ? `
          <div style="font-size: 11px; color: #F87171; margin-top: 4px;">
            Case fatality rate: ${fatalityRate}%
          </div>` : ''}
          ${d.key === 'recovered' ? `
          <div style="font-size: 11px; color: #34D399; margin-top: 4px;">
            Recovery rate: ${recoveryRate}%
          </div>` : ''}
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
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "none");

        tooltip.style("opacity", 0);
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr("y", d => y(d.value))
      .attr("height", d => height - y(d.value));

    // Chart title
    svg.append("text")
      .attr("x", containerWidth / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", isModal ? "18px" : "16px")
      .style("font-weight", "bold")
      .style("fill", "#1F2937")
      .text("COVID-19 Regional Impact Analysis");

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${containerWidth - 110}, 60)`);

    const legendItems = legend.selectAll(".legend-item")
      .data(subgroups)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legendItems.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => color(d))
      .attr("rx", 2);

    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", "12px")
      .style("fill", "#374151")
      .text(d => d.charAt(0).toUpperCase() + d.slice(1));

    // Axis labels
    svg.append("text")
      .attr("x", containerWidth / 2)
      .attr("y", containerHeight - 15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6B7280")
      .text("WHO Regions");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -containerHeight / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6B7280")
      .text("Number of Cases");

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
        className="w-full h-auto"
        style={{ 
          display: 'block',
          minHeight: isModal ? '600px' : '400px'
        }}
      />
    </div>
  );
};

export default RegionWiseBarChart;
