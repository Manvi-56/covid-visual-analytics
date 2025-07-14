import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const EmploymentImpactDistribution = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    svg.attr("width", width).attr("height", height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare data for histogram
    const values = data.map(d => d.impactPercentage).filter(d => d !== null && d !== undefined);

    // Create histogram
    const x = d3.scaleLinear()
      .domain(d3.extent(values))
      .range([0, chartWidth]);

    const histogram = d3.histogram()
      .value(d => d)
      .domain(x.domain())
      .thresholds(x.ticks(20));

    const bins = histogram(values);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([chartHeight, 0]);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(['Low', 'Medium', 'High'])
      .range(['#27ae60', '#f39c12', '#e74c3c']);

    // Create bars
    const bars = g.selectAll(".bar")
      .data(bins)
      .enter().append("g")
      .attr("class", "bar");

    bars.append("rect")
      .attr("x", d => x(d.x0))
      .attr("y", d => y(d.length))
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("height", d => chartHeight - y(d.length))
      .attr("fill", d => {
        const midpoint = (d.x0 + d.x1) / 2;
        if (midpoint >= 15) return colorScale('High');
        if (midpoint >= 8) return colorScale('Medium');
        return colorScale('Low');
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.8);
        
        // Create tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "employment-tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px")
          .style("border-radius", "4px")
          .style("font-size", "12px")
          .style("pointer-events", "none");

        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`
          Range: ${d.x0.toFixed(1)}% - ${d.x1.toFixed(1)}%<br/>
          Countries: ${d.length}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
        d3.selectAll(".employment-tooltip").remove();
      });

    // Add text labels on bars
    bars.append("text")
      .attr("x", d => x(d.x0) + (x(d.x1) - x(d.x0)) / 2)
      .attr("y", d => y(d.length) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#2c3e50")
      .text(d => d.length > 0 ? d.length : '');

    // Add x-axis
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => `${d}%`))
      .style("font-size", "12px");

    // Add y-axis
    g.append("g")
      .call(d3.axisLeft(y))
      .style("font-size", "12px");

    // Add x-axis label
    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 45)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("Percentage of Working Hours Lost");

    // Add y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -chartHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("Number of Countries");

    // Add title
    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50")
      .text("Distribution of Employment Impact Across Countries");

    // Add impact level indicators
    const legend = g.append("g")
      .attr("transform", `translate(${chartWidth - 150}, 20)`);

    const impactLevels = [
      { level: 'Low', color: '#27ae60', range: '< 8%' },
      { level: 'Medium', color: '#f39c12', range: '8-15%' },
      { level: 'High', color: '#e74c3c', range: '≥ 15%' }
    ];

    impactLevels.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendItem.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", item.color);

      legendItem.append("text")
        .attr("x", 18)
        .attr("y", 9)
        .style("font-size", "11px")
        .style("fill", "#2c3e50")
        .text(`${item.level} (${item.range})`);
    });

    // Add vertical lines for impact thresholds
    g.append("line")
      .attr("x1", x(8))
      .attr("x2", x(8))
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "#f39c12")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.7);

    g.append("line")
      .attr("x1", x(15))
      .attr("x2", x(15))
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "#e74c3c")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.7);

  }, [data]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default EmploymentImpactDistribution;
