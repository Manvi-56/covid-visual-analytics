import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const SectorHoursBarChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Function to clean numbers
    const cleanNumber = (value) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    // Get container dimensions
    const containerWidth = svgRef.current.clientWidth || 500;
    const containerHeight = svgRef.current.clientHeight || 400;
    
    const margin = { top: 50, right: 30, bottom: 80, left: 60 };
    const width = Math.max(containerWidth - margin.left - margin.right, 300);
    const height = Math.max(containerHeight - margin.top - margin.bottom, 200);

    // Filter data to realistic working hours (4-16 hours)
    const validData = data.filter(d => {
      const hours = cleanNumber(d.Hours_Worked_Per_Day);
      const sector = d.Sector;
      return hours >= 4 && hours <= 16 && sector && sector.trim() !== '';
    });

    if (validData.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#666")
        .text("No valid data available");
      return;
    }

    // Group data by sector and calculate mean hours
    const sectorData = d3.rollups(
      validData,
      v => {
        const hours = v.map(d => cleanNumber(d.Hours_Worked_Per_Day));
        return d3.mean(hours);
      },
      d => d.Sector
    ).filter(d => d[1] != null && !isNaN(d[1]));

    if (sectorData.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#666")
        .text("No sector data available");
      return;
    }

    // Create scales
    const xScale = d3.scaleBand()
      .domain(sectorData.map(d => d[0]))
      .range([0, width])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(sectorData, d => d[1]) * 1.1])
      .range([height, 0]);

    // Create SVG group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create tooltip
    const tooltip = d3.select("body")
      .selectAll(".sector-hours-tooltip")
      .data([null])
      .join("div")
      .attr("class", "sector-hours-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", "1000");

    // Create bars
    g.selectAll("rect")
      .data(sectorData)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d[0]))
      .attr("y", d => yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d[1]))
      .attr("fill", "#4F46E5")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.8);
        
        const sectorEmployees = validData.filter(item => item.Sector === d[0]);
        const hoursArray = sectorEmployees.map(item => cleanNumber(item.Hours_Worked_Per_Day));
        const minHours = d3.min(hoursArray);
        const maxHours = d3.max(hoursArray);
        
        tooltip.html(`
          <strong>${d[0]} Sector</strong><br/>
          <strong>Average Hours:</strong> ${d[1].toFixed(1)} hours<br/>
          <strong>Range:</strong> ${minHours.toFixed(1)} - ${maxHours.toFixed(1)} hours<br/>
          <strong>Employees:</strong> ${sectorEmployees.length}
        `)
          .style("opacity", 1)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
        tooltip.style("opacity", 0);
      });

    // Add value labels on bars
    g.selectAll(".bar-label")
      .data(sectorData)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => xScale(d[0]) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d[1]) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text(d => d[1].toFixed(1));

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(yScale));

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#333")
      .text("Average Hours Worked Per Day");

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#333")
      .text("Sector");

    // Add title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Working Hours by Sector");

  }, [data]);

  return (
    <div className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default SectorHoursBarChart;
