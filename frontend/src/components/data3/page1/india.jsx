import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./india.css"

const IndiaCovidMap = ({ data }) => {
  const svgRef = useRef();
  const [metric, setMetric] = useState("Confirmed");

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 800, height = 1000;
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    svg.selectAll("*").remove();

    // ✅ Custom vivid color scales with 4-point interpolation
    const colorStops = {
      Confirmed: ["#A7FFB0", "#77E584", "#46CB59", "#00a919ff"],
      Active: ["#68bbe3", "#0e86d4", "#055c9d", "#003a73ff"],
      Deaths: ["#FFB854", "#F48A38", "#EA5B1C", "#f03e03ff"],
    };

    const totalVal = d3.sum(data, d => d[metric]);

    d3.json("/data/india_state.geojson")
      .then(geoData => {
        console.log("Geo data:", geoData); // 👈 This logs all featur
        console.log("Geo Features:", geoData.features); // 👈 This logs all featur
        const projection = d3.geoMercator().fitSize([width, height], geoData);
        const path = d3.geoPath().projection(projection);

        const covidMap = new Map();
        data.forEach(d => {
          covidMap.set(d.State.toLowerCase(), {
            Confirmed: d.Confirmed,
            Active: d.Active,
            Deaths: d.Deaths
          });
        });

        const values = data.map(d => d[metric]);
        const minVal = d3.min(values);
        const maxVal = d3.max(values);

        // ✅ Create interpolated color scale using 4 stops
        const color = d3.scaleLinear()
          .domain([minVal, minVal + (maxVal - minVal) / 3, minVal + 2 * (maxVal - minVal) / 3, maxVal])
          .range(colorStops[metric]);

        // ✅ Draw each state
        svg.selectAll("path")
          .data(geoData.features)
          .join("path")
          .attr("d", path)
          .attr("fill", d => {
  const state = d.properties.NAME_1?.toLowerCase();
  const val = covidMap.get(state)?.[metric];
  if (!val || !totalVal) return "#eee";

  const percent = (val / totalVal) * 100;

  if (percent >= 10) return colorStops[metric][3];
  if (percent >= 4)  return colorStops[metric][2];
  if (percent >= 2)  return colorStops[metric][1];
  if (percent >  0)  return colorStops[metric][0];
  return "#eee";
})

          .attr("stroke", "#333")
          .attr("stroke-width", 0.5);

        // ✅ Show "State (xx%)" label
        svg.selectAll("text")
          .data(geoData.features)
          .join("text")
          .attr("transform", d => {
            const centroid = path.centroid(d);
            return `translate(${centroid})`;
          })
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("font-size", "8px")
          .attr("fill", "#000")
          .text(d => {
            const state = d.properties.NAME_1;
            const stateKey = state.toLowerCase();
            const val = covidMap.get(stateKey)?.[metric];
            if (!val || !totalVal) return "";
            const percent = ((val / totalVal) * 100).toFixed(1);
            return `${state} (${percent}%)`;
          });

        // ✅ Color Legend
        const legendWidth = 200;
        const legendHeight = 10;
       const legendGroup = svg.append("g")
  .attr("transform", `translate(${width - legendWidth - 40}, 30)`);


        const defs = svg.append("defs");
        const gradientId = "legend-gradient";

        const linearGradient = defs.append("linearGradient")
          .attr("id", gradientId);

        linearGradient.selectAll("stop")
          .data([
            { offset: "0%", color: colorStops[metric][0] },
            { offset: "33%", color: colorStops[metric][1] },
            { offset: "66%", color: colorStops[metric][2] },
            { offset: "100%", color: colorStops[metric][3] },
          ])
          .join("stop")
          .attr("offset", d => d.offset)
          .attr("stop-color", d => d.color);

        legendGroup.append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", `url(#${gradientId})`);

        const legendScale = d3.scaleLinear()
          .domain([minVal, maxVal])
          .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
          .ticks(5)
          .tickFormat(d3.format(".2s"));

        legendGroup.append("g")
          .attr("transform", `translate(0, ${legendHeight})`)
          .call(legendAxis)
          .select(".domain").remove();

        legendGroup.append("text")
          .attr("x", legendWidth / 2)
          .attr("y", -6)
          .attr("text-anchor", "middle")
          .attr("fill", "#333")
          .attr("font-size", "12px")
          .text(`${metric} Cases`);
      });
  }, [data, metric]);

  return (
    <div>
      <div className="filter-india" style={{ margin: "10px" } }>
        <label style={{ fontWeight: "bold", marginRight: "10px" }}>Select Metric:</label>
        <select value={metric} onChange={e => setMetric(e.target.value)}>
          <option value="Confirmed">Confirmed</option>
          <option value="Active">Active</option>
          <option value="Deaths">Deaths</option>
        </select>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default IndiaCovidMap;
