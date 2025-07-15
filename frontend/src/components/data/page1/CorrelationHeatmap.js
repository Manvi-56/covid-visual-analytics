import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const HoursStressHeatmap = ({ data }) => {
  const svgRef = useRef();
  const [insightText, setInsightText] = useState("");

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
    const containerWidth = svgRef.current.clientWidth || 600;
    const containerHeight = svgRef.current.clientHeight || 400;
    
    const margin = { top: 50, right: 30, bottom: 60, left: 70 };
    const width = Math.max(containerWidth - margin.left - margin.right, 300);
    const height = Math.max(containerHeight - margin.top - margin.bottom, 200);

    const hoursBins = d3
      .bin()
      .thresholds([4, 6, 8, 10, 12])
      .value((d) => cleanNumber(d.Hours_Worked_Per_Day))(data);

    const stressLevels = ["Low", "Medium", "High"];

    const heatmapData = [];
    const stressCount = { Low: 0, Medium: 0, High: 0 };

    hoursBins.forEach((bin, i) => {
      const label = `${bin.x0}-${bin.x1}`;
      stressLevels.forEach((stress) => {
        const count = bin.filter((d) => d.Stress_Level === stress).length;
        heatmapData.push({ hoursBin: label, stress, count });
        stressCount[stress] += count;
      });
    });

    // Generate insight
    const maxStress = Object.entries(stressCount).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    setInsightText(`🔍 Most employees experiencing stress worked in '${maxStress}' stress level.`);

    const x = d3
      .scaleBand()
      .domain([...new Set(heatmapData.map((d) => d.hoursBin))])
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleBand().domain(stressLevels).range([0, height]).padding(0.1);

    const color = d3
      .scaleSequential(d3.interpolateReds)
      .domain([0, d3.max(heatmapData, (d) => d.count)]);

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create tooltip with PieChart style
    const tooltip = d3.select("body")
      .selectAll(".heatmap-tooltip")
      .data([null])
      .join("div")
      .attr("class", "heatmap-tooltip")
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

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Y axis
    g.append("g").call(d3.axisLeft(y));

    // Rects
    g.selectAll("rect")
      .data(heatmapData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.hoursBin))
      .attr("y", (d) => y(d.stress))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", (d) => (d.count > 0 ? color(d.count) : "#f0f0f0"))
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        // Enhance the cell
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("stroke", "white")
          .attr("stroke-width", 2);

        const totalInBin = heatmapData
          .filter(item => item.hoursBin === d.hoursBin)
          .reduce((sum, item) => sum + item.count, 0);
        const percentage = totalInBin > 0 ? ((d.count / totalInBin) * 100).toFixed(1) : "0.0";

        // Enhanced tooltip content
        const tooltipContent = `
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #60A5FA;">
            ${d.hoursBin} Hours - ${d.stress} Stress
          </div>
          <div style="margin-bottom: 6px;">
            <span style="color: ${d.count > 0 ? color(d.count) : "#94A3B8"}; font-size: 16px;">●</span> 
            <span style="font-weight: 600;">Count:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${d.count.toLocaleString()}</span>
          </div>
          <div style="font-size: 12px; color: #CBD5E1; margin-bottom: 4px;">
            ${percentage}% of employees in this work hour range
          </div>
          <div style="font-size: 11px; color: #94A3B8;">
            Correlation between working hours and stress levels
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
          .attr("stroke", "white")
          .attr("stroke-width", 1);

        tooltip.style("opacity", 0);
      });

    // Text inside cells
    g.selectAll("text.count")
      .data(heatmapData)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.hoursBin) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.stress) + y.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", (d) => (d.count > 0 ? "#000" : "#aaa"))
      .style("font-size", "12px")
      .text((d) => d.count);

    // Axis labels
    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 40)
      .attr("text-anchor", "middle")
      .text("Hours Worked Per Day (binned)");

    svg
      .append("text")
      .attr("x", -(height / 2) - margin.top)
      .attr("y", 20)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Stress Level");

    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Heatmap: Hours Worked vs Stress Level");
  }, [data]);

  return (
    <div className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full"></svg>
      {/* <div style={{ marginTop: "15px", fontStyle: "italic", fontSize: "14px" }}>{insightText}</div> */}
    </div>
  );
};

export default HoursStressHeatmap;
