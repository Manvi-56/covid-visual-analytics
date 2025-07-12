import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const HoursStressHeatmap = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [insightText, setInsightText] = useState("");

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 50, right: 30, bottom: 60, left: 70 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const hoursBins = d3
      .bin()
      .thresholds([4, 6, 8, 10, 12])
      .value((d) => +d.Hours_Worked_Per_Day)(data);

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

    // Tooltip
    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "8px 12px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
      .style("display", "none");

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
      .on("mouseover", function (event, d) {
        tooltip
          .style("display", "block")
          .html(
            `<strong>Hours:</strong> ${d.hoursBin}<br/><strong>Stress:</strong> ${d.stress}<br/><strong>Count:</strong> ${d.count}`
          );
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("display", "none");
        d3.select(this).attr("opacity", 1);
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
    <>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
      {/* <div style={{ marginTop: "15px", fontStyle: "italic", fontSize: "14px" }}>{insightText}</div> */}
    </>
  );
};

export default HoursStressHeatmap;
