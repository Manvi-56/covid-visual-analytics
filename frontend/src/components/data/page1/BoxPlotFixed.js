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

    // Group data by sector for box plot statistics
    const sectorData = {};
    validData.forEach(d => {
      const sector = d.Sector;
      const hours = cleanNumber(d.Hours_Worked_Per_Day);
      
      if (!sectorData[sector]) {
        sectorData[sector] = [];
      }
      sectorData[sector].push(hours);
    });

    // Calculate box plot statistics for each sector
    const boxPlotData = Object.keys(sectorData).map(sector => {
      const hours = sectorData[sector].sort((a, b) => a - b);
      const n = hours.length;
      
      const q1 = d3.quantile(hours, 0.25);
      const median = d3.quantile(hours, 0.5);
      const q3 = d3.quantile(hours, 0.75);
      const iqr = q3 - q1;
      
      // Calculate whiskers (1.5 * IQR rule)
      const lowerWhisker = Math.max(hours[0], q1 - 1.5 * iqr);
      const upperWhisker = Math.min(hours[n - 1], q3 + 1.5 * iqr);
      
      // Find outliers
      const outliers = hours.filter(h => h < lowerWhisker || h > upperWhisker);
      
      const mean = hours.reduce((sum, h) => sum + h, 0) / n;
      
      return {
        sector,
        q1,
        median,
        q3,
        lowerWhisker,
        upperWhisker,
        outliers,
        mean,
        count: n,
        min: hours[0],
        max: hours[n - 1],
        data: hours
      };
    });

    console.log('Box plot data:', boxPlotData);

    if (boxPlotData.length === 0) {
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
      .domain(boxPlotData.map(d => d.sector))
      .range([0, width])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(boxPlotData, d => d.min) - 0.5,
        d3.max(boxPlotData, d => d.max) + 0.5
      ])
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
      .style("padding", "12px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", "1000")
      .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)")
      .style("border", "1px solid rgba(255, 255, 255, 0.1)");

    // Create box plots for each sector
    boxPlotData.forEach(d => {
      const x = xScale(d.sector);
      const boxWidth = xScale.bandwidth();
      const centerX = x + boxWidth / 2;
      
      // Vertical line (whiskers)
      g.append("line")
        .attr("x1", centerX)
        .attr("x2", centerX)
        .attr("y1", yScale(d.lowerWhisker))
        .attr("y2", yScale(d.upperWhisker))
        .attr("stroke", "#333")
        .attr("stroke-width", 1);
      
      // Whisker caps
      g.append("line")
        .attr("x1", centerX - boxWidth * 0.15)
        .attr("x2", centerX + boxWidth * 0.15)
        .attr("y1", yScale(d.lowerWhisker))
        .attr("y2", yScale(d.lowerWhisker))
        .attr("stroke", "#333")
        .attr("stroke-width", 1);
      
      g.append("line")
        .attr("x1", centerX - boxWidth * 0.15)
        .attr("x2", centerX + boxWidth * 0.15)
        .attr("y1", yScale(d.upperWhisker))
        .attr("y2", yScale(d.upperWhisker))
        .attr("stroke", "#333")
        .attr("stroke-width", 1);
      
      // Box (IQR)
      const boxHeight = yScale(d.q1) - yScale(d.q3);
      const boxRect = g.append("rect")
        .attr("x", x + boxWidth * 0.2)
        .attr("y", yScale(d.q3))
        .attr("width", boxWidth * 0.6)
        .attr("height", boxHeight)
        .attr("fill", "#4F46E5")
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .attr("opacity", 0.7)
        .style("cursor", "pointer");
      
      // Median line
      g.append("line")
        .attr("x1", x + boxWidth * 0.2)
        .attr("x2", x + boxWidth * 0.8)
        .attr("y1", yScale(d.median))
        .attr("y2", yScale(d.median))
        .attr("stroke", "#333")
        .attr("stroke-width", 2);
      
      // Mean dot
      g.append("circle")
        .attr("cx", centerX)
        .attr("cy", yScale(d.mean))
        .attr("r", 3)
        .attr("fill", "red")
        .attr("stroke", "white")
        .attr("stroke-width", 1);
      
      // Outliers
      d.outliers.forEach(outlier => {
        g.append("circle")
          .attr("cx", centerX + (Math.random() - 0.5) * boxWidth * 0.1) // Add small jitter
          .attr("cy", yScale(outlier))
          .attr("r", 2)
          .attr("fill", "#ff6b6b")
          .attr("stroke", "white")
          .attr("stroke-width", 0.5);
      });
      
      // Add hover interactions
      boxRect.on("mouseover", function(event) {
        d3.select(this).attr("opacity", 0.9);
        
        tooltip.html(`
          <strong>${d.sector} Sector</strong><br/>
          <strong>Sample Size:</strong> ${d.count} employees<br/>
          <strong>Mean:</strong> ${d.mean.toFixed(2)} hours<br/>
          <strong>Median:</strong> ${d.median.toFixed(2)} hours<br/>
          <strong>Q1:</strong> ${d.q1.toFixed(2)} hours<br/>
          <strong>Q3:</strong> ${d.q3.toFixed(2)} hours<br/>
          <strong>Range:</strong> ${d.min.toFixed(1)} - ${d.max.toFixed(1)} hours<br/>
          <strong>Outliers:</strong> ${d.outliers.length} data points
        `)
          .style("opacity", 1)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.7);
        tooltip.style("opacity", 0);
      });
    });

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
      .text("Hours Worked Per Day");

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
      .text("Working Hours Distribution by Sector");

    // Add legend
    const legendY = height + margin.bottom - 35;
    
    g.append("rect")
      .attr("x", 10)
      .attr("y", legendY - 5)
      .attr("width", 15)
      .attr("height", 10)
      .attr("fill", "#4F46E5")
      .attr("opacity", 0.7);
    
    g.append("text")
      .attr("x", 30)
      .attr("y", legendY)
      .style("font-size", "12px")
      .style("fill", "#333")
      .text("IQR (25th-75th percentile)");
    
    g.append("circle")
      .attr("cx", 200)
      .attr("cy", legendY)
      .attr("r", 3)
      .attr("fill", "red");
    
    g.append("text")
      .attr("x", 210)
      .attr("y", legendY + 1)
      .style("font-size", "12px")
      .style("fill", "#333")
      .text("Mean");
    
    g.append("circle")
      .attr("cx", 270)
      .attr("cy", legendY)
      .attr("r", 2)
      .attr("fill", "#ff6b6b");
    
    g.append("text")
      .attr("x", 280)
      .attr("y", legendY + 1)
      .style("font-size", "12px")
      .style("fill", "#333")
      .text("Outliers");

  }, [data]);

  return (
    <div className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default SectorHoursBarChart;
