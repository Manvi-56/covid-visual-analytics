import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const SectorBarChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Function to clean malformed numbers - SIMPLIFIED for cleaned data
    const cleanNumber = (value) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    // Get the container dimensions
    const containerWidth = svgRef.current.clientWidth || 800;
    const containerHeight = svgRef.current.clientHeight || 450;
    
    const margin = { top: 40, right: 100, bottom: 60, left: 60 };
    const width = Math.max(containerWidth - margin.left - margin.right, 300);
    const height = Math.max(containerHeight - margin.top - margin.bottom, 250);

    const stressLevels = ["Low", "Medium", "High"];
    const colorMap = {
      "Low": "#000c67ff",
      "Medium": "#c00033ff",
      "High": "#5a24d7ff"
    };

    // Create tooltip with PieChart style
    const tooltip = d3.select("body")
      .selectAll(".sector-bar-tooltip")
      .data([null])
      .join("div")
      .attr("class", "sector-bar-tooltip")
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

    const grouped = d3.rollups(
      data,
      v => v.length,
      d => d.Sector,
      d => d.Stress_Level
    );

    const processed = grouped.map(([sector, stressGroups]) => {
      const obj = { Sector: sector };
      stressGroups.forEach(([stress, count]) => {
        obj[stress] = count;
      });
      return obj;
    });

    const allSectors = processed.map(d => d.Sector);

    const x0 = d3.scaleBand().domain(allSectors).range([0, width]).padding(0.2);
    const x1 = d3.scaleBand().domain(stressLevels).range([0, x0.bandwidth()]).padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(processed, d => Math.max(...stressLevels.map(k => d[k] || 0))) + 50])
      .range([height, 0]);

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0));

    // Y Axis with grid lines
    g.append("g")
      .call(d3.axisLeft(y).ticks(10))
      .call(g => g.selectAll(".tick line")
        .attr("x2", width)
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "2,2"))
      .call(g => g.select(".domain").remove());

    // Bar groups
    const sectorGroups = g.selectAll("g.sector")
      .data(processed)
      .enter()
      .append("g")
      .attr("class", "sector")
      .attr("transform", d => `translate(${x0(d.Sector)},0)`);

    sectorGroups.selectAll("rect")
      .data(d => stressLevels.map(stress => ({
        stress,
        value: d[stress] || 0,
        sector: d.Sector
      })))
      .enter()
      .append("rect")
      .attr("x", d => x1(d.stress))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => colorMap[d.stress])
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        // Enhance the bar
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("stroke", "white")
          .attr("stroke-width", 2);

        const filtered = data.filter(
          row => row.Sector === d.sector && row.Stress_Level === d.stress
        );

        const avgProd = d3.mean(filtered, d => cleanNumber(d.Productivity_Change)) || 0;
        const avgHours = d3.mean(filtered, d => cleanNumber(d.Hours_Worked_Per_Day)) || 0;
        const healthRate = (d3.mean(filtered, d => cleanNumber(d.Health_Issue)) * 100) || 0;

        // Enhanced tooltip content
        const tooltipContent = `
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #60A5FA;">
            ${d.sector} - ${d.stress} Stress
          </div>
          <div style="margin-bottom: 6px;">
            <span style="color: ${colorMap[d.stress]}; font-size: 16px;">●</span> 
            <span style="font-weight: 600;">Count:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${d.value.toLocaleString()}</span>
          </div>
          <div style="font-size: 12px; color: #CBD5E1; margin-bottom: 4px;">
            <span style="font-weight: 600;">Avg Productivity Change:</span> ${avgProd.toFixed(1)}%
          </div>
          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 2px;">
            <span style="font-weight: 600;">Avg Hours Worked:</span> ${avgHours.toFixed(1)} hours/day
          </div>
          <div style="font-size: 11px; color: #94A3B8;">
            <span style="font-weight: 600;">Health Issues:</span> ${healthRate.toFixed(1)}% of employees
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
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke", "none");

        tooltip.style("opacity", 0);
      });

    // Legend with title
    const legend = svg.append("g").attr("transform", `translate(${width + 70}, 40)`);

    legend.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .text("Stress")
      .style("font-size", "14px")
      .style("font-weight", "bold");

    stressLevels.forEach((key, i) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 22)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorMap[key]);

      legend.append("text")
        .attr("x", 20)
        .attr("y", i * 22 + 12)
        .text(key)
        .style("font-size", "13px");
    });

  }, [data]);

  return (
    <div className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default SectorBarChart;
