import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RegionalEmploymentComparison = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };

    svg.attr("width", width).attr("height", height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Group data by region
    const regions = Array.from(new Set(data.map(d => d.region)))
      .filter(region => region !== 'Other')
      .sort();

    const regionalData = regions.map(region => {
      const regionCountries = data.filter(d => d.region === region);
      const hoursLost = regionCountries.map(d => d.impactPercentage).filter(d => d !== null && d !== undefined);
      const femaleRatios = regionCountries.map(d => {
        const ratio = d.femaleEmployment > 0 ? (d.femaleEmployment / (d.maleEmployment + d.femaleEmployment)) * 100 : 0;
        return ratio;
      }).filter(d => d !== null && d !== undefined);
      const dependencyRatios = regionCountries.map(d => d.laborDependency).filter(d => d !== null && d !== undefined);

      return {
        region,
        countries: regionCountries.length,
        avgHoursLost: hoursLost.length > 0 ? hoursLost.reduce((a, b) => a + b, 0) / hoursLost.length : 0,
        maxHoursLost: hoursLost.length > 0 ? Math.max(...hoursLost) : 0,
        minHoursLost: hoursLost.length > 0 ? Math.min(...hoursLost) : 0,
        avgFemaleRatio: femaleRatios.length > 0 ? femaleRatios.reduce((a, b) => a + b, 0) / femaleRatios.length : 0,
        avgDependencyRatio: dependencyRatios.length > 0 ? dependencyRatios.reduce((a, b) => a + b, 0) / dependencyRatios.length : 0,
        hoursLostData: hoursLost,
        rawData: regionCountries
      };
    });

    // Create scales
    const x = d3.scaleBand()
      .domain(regions)
      .range([0, chartWidth])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(regionalData, d => d.maxHoursLost)])
      .range([chartHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(regions)
      .range(['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6']);

    // Create box plots for each region
    regions.forEach((region, i) => {
      const regionData = regionalData[i];
      const hoursLost = regionData.hoursLostData.sort(d3.ascending);
      
      if (hoursLost.length === 0) return;

      const q1 = d3.quantile(hoursLost, 0.25);
      const median = d3.quantile(hoursLost, 0.5);
      const q3 = d3.quantile(hoursLost, 0.75);
      const iqr = q3 - q1;
      const min = Math.max(d3.min(hoursLost), q1 - 1.5 * iqr);
      const max = Math.min(d3.max(hoursLost), q3 + 1.5 * iqr);

      const boxWidth = x.bandwidth() * 0.6;
      const boxX = x(region) + (x.bandwidth() - boxWidth) / 2;

      // Box plot group
      const boxPlot = g.append("g")
        .attr("class", `box-plot-${i}`);

      // Vertical line (min to max)
      boxPlot.append("line")
        .attr("x1", x(region) + x.bandwidth() / 2)
        .attr("x2", x(region) + x.bandwidth() / 2)
        .attr("y1", y(min))
        .attr("y2", y(max))
        .attr("stroke", colorScale(region))
        .attr("stroke-width", 2);

      // Box (Q1 to Q3)
      boxPlot.append("rect")
        .attr("x", boxX)
        .attr("y", y(q3))
        .attr("width", boxWidth)
        .attr("height", y(q1) - y(q3))
        .attr("fill", colorScale(region))
        .attr("fill-opacity", 0.7)
        .attr("stroke", colorScale(region))
        .attr("stroke-width", 2);

      // Median line
      boxPlot.append("line")
        .attr("x1", boxX)
        .attr("x2", boxX + boxWidth)
        .attr("y1", y(median))
        .attr("y2", y(median))
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 3);

      // Min and max lines
      boxPlot.append("line")
        .attr("x1", boxX + boxWidth * 0.25)
        .attr("x2", boxX + boxWidth * 0.75)
        .attr("y1", y(min))
        .attr("y2", y(min))
        .attr("stroke", colorScale(region))
        .attr("stroke-width", 2);

      boxPlot.append("line")
        .attr("x1", boxX + boxWidth * 0.25)
        .attr("x2", boxX + boxWidth * 0.75)
        .attr("y1", y(max))
        .attr("y2", y(max))
        .attr("stroke", colorScale(region))
        .attr("stroke-width", 2);

      // Add outliers
      const outliers = hoursLost.filter(d => d < min || d > max);
      boxPlot.selectAll(".outlier")
        .data(outliers)
        .enter().append("circle")
        .attr("class", "outlier")
        .attr("cx", x(region) + x.bandwidth() / 2)
        .attr("cy", d => y(d))
        .attr("r", 3)
        .attr("fill", colorScale(region))
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1);

      // Add country count label
      g.append("text")
        .attr("x", x(region) + x.bandwidth() / 2)
        .attr("y", chartHeight + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "#7f8c8d")
        .text(`(${regionData.countries} countries)`);

      // Hover effect for box plot
      const hoverRect = boxPlot.append("rect")
        .attr("x", x(region))
        .attr("y", 0)
        .attr("width", x.bandwidth())
        .attr("height", chartHeight)
        .attr("fill", "transparent")
        .style("cursor", "pointer")
        .on("mouseover", function(event) {
          // Create tooltip
          const tooltip = d3.select("body").append("div")
            .attr("class", "employment-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.9)")
            .style("color", "white")
            .style("padding", "12px")
            .style("border-radius", "6px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("max-width", "250px");

          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html(`
            <strong>${region} Region</strong><br/>
            Countries: ${regionData.countries}<br/>
            Median Hours Lost: ${median.toFixed(1)}%<br/>
            Q1: ${q1.toFixed(1)}% | Q3: ${q3.toFixed(1)}%<br/>
            Range: ${min.toFixed(1)}% - ${max.toFixed(1)}%<br/>
            Avg Female Employment: ${regionData.avgFemaleRatio.toFixed(1)}%<br/>
            Avg Dependency Ratio: ${regionData.avgDependencyRatio.toFixed(2)}
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");

          // Highlight box plot
          boxPlot.selectAll("rect")
            .attr("fill-opacity", 0.9);
        })
        .on("mouseout", function() {
          d3.selectAll(".employment-tooltip").remove();
          boxPlot.selectAll("rect")
            .attr("fill-opacity", 0.7);
        });
    });

    // Add x-axis
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-weight", "bold");

    // Add y-axis
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${d}%`))
      .style("font-size", "12px");

    // Add x-axis label
    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 60)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("World Regions");

    // Add y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -chartHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("Percentage of Working Hours Lost");

    // Add title
    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("Regional Employment Impact Distribution (Box Plots)");

    // Add legend for box plot components
    const legend = g.append("g")
      .attr("transform", `translate(${chartWidth - 200}, 20)`);

    const legendItems = [
      { label: "Median", color: "#2c3e50", type: "line" },
      { label: "Q1-Q3 (Box)", color: colorScale(regions[0]), type: "box" },
      { label: "Min-Max Range", color: colorScale(regions[0]), type: "line" },
      { label: "Outliers", color: colorScale(regions[0]), type: "circle" }
    ];

    legendItems.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      if (item.type === "box") {
        legendItem.append("rect")
          .attr("width", 12)
          .attr("height", 8)
          .attr("fill", item.color)
          .attr("fill-opacity", 0.7)
          .attr("stroke", item.color);
      } else if (item.type === "circle") {
        legendItem.append("circle")
          .attr("cx", 6)
          .attr("cy", 4)
          .attr("r", 3)
          .attr("fill", item.color);
      } else {
        legendItem.append("line")
          .attr("x1", 0)
          .attr("x2", 12)
          .attr("y1", 4)
          .attr("y2", 4)
          .attr("stroke", item.color)
          .attr("stroke-width", 3);
      }

      legendItem.append("text")
        .attr("x", 18)
        .attr("y", 8)
        .style("font-size", "11px")
        .style("fill", "#2c3e50")
        .text(item.label);
    });

  }, [data]);

  return (
    <div className="chart-container large">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RegionalEmploymentComparison;
