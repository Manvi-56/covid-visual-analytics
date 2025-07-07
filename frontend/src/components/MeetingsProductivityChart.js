import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const MeetingsVsProductivityBar = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [selectedSector, setSelectedSector] = useState("All");
  const [insightText, setInsightText] = useState("");

  const stressLevels = ["Low", "Medium", "High"];
  const colorMap = {
    Low: "#1f77b4",
    Medium: "#ff7f0e",
    High: "#d62728"
  };

  const sectors = ["All", ...Array.from(new Set(data.map((d) => d.Sector)))];

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 50, right: 160, bottom: 60, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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

    const filteredData =
      selectedSector === "All"
        ? data
        : data.filter((d) => d.Sector === selectedSector);

    // Custom bins with clean labels
    const thresholds = [0, 10, 20, 30, 40, 50, Infinity];
    const binLabels = ["0-10", "10-20", "20-30", "30-40", "40-50", "50+"];

    const bins = Array(thresholds.length - 1)
      .fill(0)
      .map(() => []);

    filteredData.forEach((d) => {
      const val = +d.Meetings_Per_Day;
      for (let i = 0; i < thresholds.length - 1; i++) {
        if (val >= thresholds[i] && val < thresholds[i + 1]) {
          bins[i].push(d);
          break;
        }
      }
    });

    const processed = [];
    const averages = { Low: [], Medium: [], High: [] };

    bins.forEach((bin, i) => {
      const binLabel = binLabels[i];
      stressLevels.forEach((stress) => {
        const subset = bin.filter((d) => d.Stress_Level === stress);
        const count = subset.length;
        const productive = subset.filter((d) => d.Productivity_Change === 1).length;
        const percentage = count > 0 ? (productive / count) * 100 : 0;
        averages[stress].push(percentage);

        processed.push({
          binLabel,
          stress,
          count,
          productive,
          percentage: percentage.toFixed(1)
        });
      });
    });

    // Generate dynamic insight
    const avgSummary = stressLevels.map(stress => {
      const values = averages[stress].filter(v => !isNaN(v));
      const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;
      return `${stress}: ${avg}%`;
    }).join(", ");

    setInsightText(`Average productivity by stress level → ${avgSummary}. This suggests that ${selectedSector === "All" ? "across sectors" : `in ${selectedSector}`} stress level has a mild effect on productivity.`);

    const x0 = d3
      .scaleBand()
      .domain(binLabels)
      .range([0, width])
      .padding(0.2);

    const x1 = d3
      .scaleBand()
      .domain(stressLevels)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0));

    g.append("g")
      .call(d3.axisLeft(y).ticks(10).tickFormat((d) => d + "%"));

    const groups = g
      .selectAll("g.bin-group")
      .data(processed)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${x0(d.binLabel)},0)`);

    groups
      .selectAll("rect")
      .data((d) =>
        stressLevels.map((level) =>
          processed.find((p) => p.binLabel === d.binLabel && p.stress === level)
        )
      )
      .enter()
      .append("rect")
      .attr("x", (d) => x1(d.stress))
      .attr("y", (d) => y(d.percentage))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => height - y(d.percentage))
      .attr("fill", (d) => colorMap[d.stress])
      .on("mouseover", function (event, d) {
        tooltip
          .style("display", "block")
          .html(
            `<strong>Meetings:</strong> ${d.binLabel}<br/>` +
              `<strong>Stress:</strong> ${d.stress}<br/>` +
              `<strong>% Productive:</strong> ${d.percentage}%<br/>` +
              `<strong>Count:</strong> ${d.productive}/${d.count}`
          );
        d3.select(this).attr("opacity", 0.7);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("display", "none");
        d3.select(this).attr("opacity", 1);
      });

    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 40)
      .attr("text-anchor", "middle")
      .text("Meetings Per Day (Binned)");

    svg
      .append("text")
      .attr("x", -(height / 2) - margin.top)
      .attr("y", 20)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("% Productive Employees");

    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Productivity % vs Meetings (Grouped by Stress Level)");

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width + margin.left + 30},${margin.top})`);

    stressLevels.forEach((level, i) => {
      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", i * 22)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorMap[level]);

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", i * 22 + 12)
        .text(level)
        .style("font-size", "13px");
    });
  }, [data, selectedSector]);

  return (
    <>
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="sector-select">
          <strong>Filter by Sector: </strong>
        </label>
        <select
          id="sector-select"
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
        >
          {sectors.map((sector, idx) => (
            <option key={idx} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
      <div style={{ marginTop: "20px", fontStyle: "italic", fontSize: "14px" }}>
        🔍 <strong>Insight:</strong> {insightText}
      </div>
    </>
  );
};

export default MeetingsVsProductivityBar;
