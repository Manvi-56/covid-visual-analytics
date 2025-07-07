import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const WFHProductivityBar = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [selectedSector, setSelectedSector] = useState("All");
  const [insightText, setInsightText] = useState("");

  const sectors = ["All", ...Array.from(new Set(data.map((d) => d.Sector)))];

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 50, right: 30, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

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

    const grouped = [
      { label: "WFH: No", key: 0 },
      { label: "WFH: Yes", key: 1 },
    ];

    const result = grouped.map((group) => {
      const groupData = filteredData.filter((d) => +d.Work_From_Home === group.key);
      const count = groupData.length;
      const productive = groupData.filter((d) => d.Productivity_Change === 1).length;
      const percentage = count > 0 ? (productive / count) * 100 : 0;
      return { ...group, count, productive, percentage: +percentage.toFixed(1) };
    });

    // Insight generation
    const higher = result[0].percentage > result[1].percentage ? "WFH: No" : "WFH: Yes";
    setInsightText(
      `${selectedSector === "All" ? "Across all sectors" : `In ${selectedSector}`}, ` +
      `${higher} employees reported higher productivity levels.`
    );

    const x = d3
      .scaleBand()
      .domain(result.map((d) => d.label))
      .range([0, width])
      .padding(0.4);

    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y).ticks(10).tickFormat((d) => d + "%"));

    g.selectAll("rect")
      .data(result)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.label))
      .attr("y", (d) => y(d.percentage))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.percentage))
      .attr("fill", "#69b3a2")
      .on("mouseover", function (event, d) {
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.label}</strong><br/>` +
              `Productive: ${d.productive}/${d.count}<br/>` +
              `Percentage: ${d.percentage}%`
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
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("% Productive Employees vs Work From Home");

    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 40)
      .attr("text-anchor", "middle")
      .text("Work From Home");

    svg
      .append("text")
      .attr("x", -(height / 2) - margin.top)
      .attr("y", 20)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("% Productive Employees");
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

export default WFHProductivityBar;
