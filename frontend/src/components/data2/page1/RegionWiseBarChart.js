// src/components/data2/page1/RegionWiseBarChart.js
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const GroupedBarChart = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const containerRef = useRef();

  const chartColors = {
    cases: "#3B82F6",    // covid-blue
    deaths: "#EF4444",   // covid-red
    recovered: "#10B981", // covid-green
  };

  const drawChart = () => {
    if (!data || data.length === 0 || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;

    const margin = { top: 60, right: 100, bottom: 90, left: 70 };
    const width = Math.max(containerWidth - margin.left - margin.right, 400);
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);

    const g = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const normalizeRegion = (region) => {
      if (!region || typeof region !== "string") return "Other";
      const trimmed = region.trim();
      const map = {
        "EasternMediterranean": "Eastern Mediterranean",
        "Eastern Mediterranean": "Eastern Mediterranean",
        "South-EastAsia": "South-East Asia",
        "South-East Asia": "South-East Asia",
        "WesternPacific": "Western Pacific",
        "Western Pacific": "Western Pacific",
        "Europe": "Europe",
        "Africa": "Africa",
        "Americas": "Americas"
      };
      return map[trimmed] || "Other";
    };

    const cleanedData = data.map(d => ({
      region: normalizeRegion(d.WHORegion),
      cases: d.TotalCases,
      deaths: d.TotalDeaths,
      recovered: d.TotalRecovered
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

    const regions = grouped.map(([region]) => region);

    // --- DEBUGGING LOGS ---
    console.log("RegionWiseBarChart Data:", data);
    console.log("Cleaned and Filtered Data:", filtered);
    console.log("Grouped Data:", grouped);
    console.log("Extracted Regions:", regions);
    console.log("Calculated Chart Width:", width);
    // --- END DEBUGGING LOGS ---

    const subgroups = ["cases", "deaths", "recovered"];

    const x0 = d3.scaleBand().domain(regions).range([0, width]).padding(0.2);
    const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(0.05);
    const y = d3.scaleLinear()
        .domain([0, d3.max(grouped, ([, v]) => Math.max(v.cases, v.deaths, v.recovered)) * 1.1])
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range([chartColors.cases, chartColors.deaths, chartColors.recovered]);

    // Axes
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end")
        .style("font-size", "11px")
        // --- DEBUGGING: Temporarily force text color to black ---
        .style("fill", "black"); // Was "var(--text-dark)"
    // --- END DEBUGGING ---

    g.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2s")))
        .style("font-size", "11px")
        .style("fill", "var(--text-dark)");

    // Tooltip
    const tooltip = d3.select(tooltipRef.current)
        .attr("class", "absolute p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg pointer-events-none transition-opacity duration-200")
        .style("opacity", 0);

    // Bars
    const bars = g.selectAll(".bar-group")
        .data(grouped)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d[0])},0)`);

    bars.selectAll("rect")
        .data(d => subgroups.map(key => ({ key, value: d[1][key], region: d[0] })))
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key))
        .on("mouseover", (event, d) => {
          tooltip
              .html(`<strong>${d.region}</strong><br/>${d.key}: ${d.value.toLocaleString()}`)
              .style("opacity", 1);
          d3.select(event.currentTarget).attr("opacity", 0.7);
        })
        .on("mousemove", event => {
          const [x, y] = d3.pointer(event);
          tooltip
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 25) + "px");
        })
        .on("mouseout", event => {
          tooltip.style("opacity", 0);
          d3.select(event.currentTarget).attr("opacity", 1);
        });

    // Title and labels
    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "1.125rem")
        .style("font-weight", "bold")
        .style("fill", "var(--text-dark)")
        .text("COVID-19 Region-wise Cases, Deaths & Recoveries");

    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 75)
        .attr("text-anchor", "middle")
        .style("font-size", "0.875rem")
        // --- DEBUGGING: Temporarily force text color to black ---
        .style("fill", "black") // Was "var(--text-dark)"
        // --- END DEBUGGING ---
        .text("WHO Region");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2 - margin.top)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "0.875rem")
        .style("fill", "var(--text-dark)")
        .text("Count");

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width + margin.left + 10}, ${margin.top})`);

    subgroups.forEach((key, i) => {
      const group = legend.append("g").attr("transform", `translate(0, ${i * 25})`);
      group.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", color(key));
      group.append("text")
          .attr("x", 24)
          .attr("y", 13)
          .style("font-size", "13px")
          .style("fill", "var(--text-dark)")
          .text(key.charAt(0).toUpperCase() + key.slice(1));
    });
  };

  useEffect(() => {
    drawChart();

    const resizeObserver = new ResizeObserver(() => {
      d3.select(svgRef.current).selectAll("*").remove();
      drawChart();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      d3.select(svgRef.current).selectAll("*").remove();
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [data]);

  return (
      <div ref={containerRef} className="w-full h-full min-h-[500px] flex justify-center items-center">
        <svg ref={svgRef}></svg>
        <div ref={tooltipRef} className="z-50"></div>
      </div>
  );
};

export default GroupedBarChart;