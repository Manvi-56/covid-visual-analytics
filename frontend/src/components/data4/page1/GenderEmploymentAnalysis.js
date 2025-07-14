import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GenderEmploymentAnalysis = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };

    svg.attr("width", width).attr("height", height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create two charts: scatter plot and regional comparison
    const scatterHeight = chartHeight * 0.6;
    const barHeight = chartHeight * 0.35;
    const chartGap = 20;

    // Scatter plot for gender ratio vs employment impact
    const scatterG = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Bar chart for regional gender comparison
    const barG = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top + scatterHeight + chartGap})`);

    // Filter data with valid values and calculate female employment ratio
    const validData = data.filter(d => 
      d.maleEmployment !== null && d.femaleEmployment !== null &&
      d.impactPercentage !== null &&
      d.region !== 'Other' &&
      d.totalEmployment > 0
    ).map(d => ({
      ...d,
      femaleEmploymentRatio: (d.femaleEmployment / d.totalEmployment) * 100
    }));

    // Scatter plot scales
    const xScatter = d3.scaleLinear()
      .domain(d3.extent(validData, d => d.femaleEmploymentRatio))
      .range([0, chartWidth]);

    const yScatter = d3.scaleLinear()
      .domain(d3.extent(validData, d => d.impactPercentage))
      .range([scatterHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'])
      .range(['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6']);

    const sizeScale = d3.scaleSqrt()
      .domain(d3.extent(validData, d => d.totalEmployment))
      .range([3, 15]);

    // Create scatter plot
    const circles = scatterG.selectAll("circle")
      .data(validData)
      .enter()
      .append("circle")
      .attr("cx", d => xScatter(d.femaleEmploymentRatio))
      .attr("cy", d => yScatter(d.impactPercentage))
      .attr("r", d => sizeScale(d.totalEmployment))
      .attr("fill", d => colorScale(d.region))
      .attr("fill-opacity", 0.7)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer");

    // Add hover effects to scatter plot
    circles
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke", "#2c3e50")
          .attr("stroke-width", 2)
          .attr("fill-opacity", 1);

        const tooltip = d3.select("body").append("div")
          .attr("class", "employment-tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.9)")
          .style("color", "white")
          .style("padding", "10px")
          .style("border-radius", "5px")
          .style("font-size", "12px")
          .style("pointer-events", "none");

        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`
          <strong>${d.country}</strong><br/>
          Female Employment: ${d.femaleEmploymentRatio.toFixed(1)}%<br/>
          Hours Lost: ${d.impactPercentage.toFixed(1)}%<br/>
          Total Employed: ${(d.totalEmployment / 1000).toFixed(1)}M<br/>
          Region: ${d.region}<br/>
          Impact Level: ${d.impactLevel}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("fill-opacity", 0.7);
        
        d3.selectAll(".employment-tooltip").remove();
      });

    // Add scatter plot axes
    scatterG.append("g")
      .attr("transform", `translate(0,${scatterHeight})`)
      .call(d3.axisBottom(xScatter).tickFormat(d => `${d}%`))
      .style("font-size", "11px");

    scatterG.append("g")
      .call(d3.axisLeft(yScatter).tickFormat(d => `${d}%`))
      .style("font-size", "11px");

    // Scatter plot labels
    scatterG.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", scatterHeight + 35)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("Female Employment Ratio (%)");

    scatterG.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -scatterHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("Working Hours Lost (%)");

    scatterG.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("Gender Employment vs Impact Analysis");

    // Prepare data for regional gender comparison
    const regions = Array.from(new Set(validData.map(d => d.region))).sort();
    const regionalGenderData = regions.map(region => {
      const regionData = validData.filter(d => d.region === region);
      const femaleRatios = regionData.map(d => d.femaleEmploymentRatio);
      const hoursLost = regionData.map(d => d.impactPercentage);
      
      return {
        region,
        avgFemaleRatio: femaleRatios.reduce((a, b) => a + b, 0) / femaleRatios.length,
        avgHoursLost: hoursLost.reduce((a, b) => a + b, 0) / hoursLost.length,
        countries: regionData.length,
        totalEmployed: regionData.reduce((sum, d) => sum + d.totalEmployment, 0)
      };
    });

    // Bar chart scales
    const xBar = d3.scaleBand()
      .domain(regions)
      .range([0, chartWidth])
      .padding(0.1);

    const yBar = d3.scaleLinear()
      .domain([0, d3.max(regionalGenderData, d => d.avgFemaleRatio)])
      .range([barHeight, 0]);

    // Create bars
    const bars = barG.selectAll(".bar")
      .data(regionalGenderData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xBar(d.region))
      .attr("y", d => yBar(d.avgFemaleRatio))
      .attr("width", xBar.bandwidth())
      .attr("height", d => barHeight - yBar(d.avgFemaleRatio))
      .attr("fill", d => colorScale(d.region))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    // Add value labels on bars
    barG.selectAll(".bar-label")
      .data(regionalGenderData)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => xBar(d.region) + xBar.bandwidth() / 2)
      .attr("y", d => yBar(d.avgFemaleRatio) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text(d => `${d.avgFemaleRatio.toFixed(1)}%`);

    // Add bar chart hover effects
    bars
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("fill-opacity", 0.8);

        const tooltip = d3.select("body").append("div")
          .attr("class", "employment-tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.9)")
          .style("color", "white")
          .style("padding", "10px")
          .style("border-radius", "5px")
          .style("font-size", "12px")
          .style("pointer-events", "none");

        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`
          <strong>${d.region} Region</strong><br/>
          Avg Female Employment: ${d.avgFemaleRatio.toFixed(1)}%<br/>
          Avg Hours Lost: ${d.avgHoursLost.toFixed(1)}%<br/>
          Countries: ${d.countries}<br/>
          Total Employed: ${(d.totalEmployed / 1000000).toFixed(1)}M
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill-opacity", 1);
        d3.selectAll(".employment-tooltip").remove();
      });

    // Add bar chart axes
    barG.append("g")
      .attr("transform", `translate(0,${barHeight})`)
      .call(d3.axisBottom(xBar))
      .selectAll("text")
      .style("font-size", "11px")
      .style("font-weight", "bold");

    barG.append("g")
      .call(d3.axisLeft(yBar).tickFormat(d => `${d}%`))
      .style("font-size", "11px");

    // Bar chart labels
    barG.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", barHeight + 35)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("World Regions");

    barG.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -barHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("Average Female Employment Ratio (%)");

    barG.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("Regional Female Employment Comparison");

    // Add legend for scatter plot
    const legend = scatterG.append("g")
      .attr("transform", `translate(${chartWidth - 150}, 20)`);

    regions.forEach((region, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendItem.append("circle")
        .attr("cx", 8)
        .attr("cy", 8)
        .attr("r", 6)
        .attr("fill", colorScale(region))
        .attr("fill-opacity", 0.7);

      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "11px")
        .style("fill", "#2c3e50")
        .text(region);
    });

    // Add size legend
    const sizeLegend = scatterG.append("g")
      .attr("transform", `translate(20, 20)`);

    sizeLegend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("Circle Size:");

    sizeLegend.append("text")
      .attr("x", 0)
      .attr("y", 15)
      .style("font-size", "10px")
      .style("fill", "#7f8c8d")
      .text("Total Employment");

    const sizeValues = [1000, 5000, 10000]; // in thousands
    sizeValues.forEach((value, i) => {
      sizeLegend.append("circle")
        .attr("cx", i * 40 + 15)
        .attr("cy", 35)
        .attr("r", sizeScale(value * 1000))
        .attr("fill", "#bdc3c7")
        .attr("fill-opacity", 0.7);

      sizeLegend.append("text")
        .attr("x", i * 40 + 15)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .style("font-size", "9px")
        .style("fill", "#7f8c8d")
        .text(`${value}K`);
    });

    // Add trend line to scatter plot
    const regression = linearRegression(validData.map(d => [d.femaleEmploymentRatio, d.percentageHoursLost]));
    const xExtent = d3.extent(validData, d => d.femaleEmploymentRatio);
    const trendLine = scatterG.append("line")
      .attr("x1", xScatter(xExtent[0]))
      .attr("x2", xScatter(xExtent[1]))
      .attr("y1", yScatter(regression.slope * xExtent[0] + regression.intercept))
      .attr("y2", yScatter(regression.slope * xExtent[1] + regression.intercept))
      .attr("stroke", "#34495e")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.7);

  }, [data]);

  // Helper function for linear regression
  const linearRegression = (data) => {
    const n = data.length;
    const sumX = data.reduce((sum, [x]) => sum + x, 0);
    const sumY = data.reduce((sum, [, y]) => sum + y, 0);
    const sumXY = data.reduce((sum, [x, y]) => sum + x * y, 0);
    const sumXX = data.reduce((sum, [x]) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  return (
    <div className="chart-container large">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default GenderEmploymentAnalysis;
