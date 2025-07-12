import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const SectorBarChart = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 150, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const stressLevels = ["Low", "Medium", "High"];
    const colorMap = {
      "Low": "#000c67ff",
      "Medium": "#c00033ff",
      "High": "#5a24d7ff"
    };

    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "8px 12px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
      .style("display", "none");

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
      .on("mouseover", function (event, d) {
        const filtered = data.filter(
          row => row.Sector === d.sector && row.Stress_Level === d.stress
        );

        const avgProd = (d3.mean(filtered, d => +d.Productivity_Change) || 0).toFixed(2);
        const avgHours = (d3.mean(filtered, d => +d.Hours_Worked_Per_Day) || 0).toFixed(2);
        const healthRate = ((d3.mean(filtered, d => +d.Health_Issue) || 0) * 100).toFixed(1);

        tooltip
          .style("display", "block")
          .html(
            `<strong>Sector:</strong> ${d.sector}<br/>` +
            `<strong>Stress:</strong> ${d.stress}<br/>` +
            `<strong>Count:</strong> ${d.value}<br/>` +
            `<strong>Avg Productivity:</strong> ${avgProd}<br/>` +
            `<strong>Avg Hours Worked:</strong> ${avgHours}<br/>` +
            `<strong>Health Issue %:</strong> ${healthRate}%`
          );
        d3.select(this).attr("opacity", 0.7);
      })
      .on("mousemove", event => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("display", "none");
        d3.select(this).attr("opacity", 1);
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
    <>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </>
  );
};

export default SectorBarChart;
