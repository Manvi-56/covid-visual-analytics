// src/components/data2/page1/PieChart.js
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const ContinentPieChart = ({ data }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const containerRef = useRef(); // Ref for the parent container to get its width
    const [metric, setMetric] = useState("TotalDeaths");

    // Define custom colors for pie slices, aligned with your Tailwind theme
    const pieColors = d3.scaleOrdinal()
        .domain(["Asia", "Europe", "Africa", "North America", "South America", "Oceania"])
        .range([
            "#3B82F6", // covid-blue
            "#EF4444", // covid-red
            "#10B981", // covid-green
            "#8B5CF6", // purple-500
            "#EC4899", // pink-500
            "#F59E0B"  // amber-500
        ]);

    // Main drawing function
    const drawChart = () => {
        if (!data || data.length === 0 || !containerRef.current) {
            // console.log("PieChart: Data not loaded or container not ready."); // Debugging
            return;
        }

        const containerWidth = containerRef.current.clientWidth;
        // Set a reasonable dynamic width and height for the SVG
        const width = Math.max(containerWidth, 300); // Minimum width of 300px
        const height = Math.min(width, 300); // Keep it square or slightly flexible
        const radius = Math.min(width, height) / 2;

        const svg = d3.select(svgRef.current);
        // Ensure the SVG dimensions are set on each draw
        svg.attr("width", width)
            .attr("height", height);

        // Clear previous group to prevent accumulation on redraws
        svg.select("g").remove();

        const g = svg
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2 + 10})`);

        const tooltip = d3
            .select(tooltipRef.current)
            .attr("class", "absolute p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg pointer-events-none transition-opacity duration-200")
            .style("opacity", 0); // Start hidden, fade in

        const groupedData = d3
            .rollups(
                data,
                (v) => d3.sum(v, (d) => +d[metric]),
                (d) => d.Continent
            )
            .filter(
                ([continent]) =>
                    continent &&
                    continent !== "" &&
                    continent !== "Oceania" &&
                    continent !== "Australia/Oceania"
            );

        const pie = d3.pie().value((d) => d[1]).sort(null);
        const arc = d3
            .arc()
            .innerRadius(0)
            .outerRadius(radius - 10);
        const labelArc = d3
            .arc()
            .innerRadius(radius * 0.65)
            .outerRadius(radius * 0.65);

        const arcs = g
            .selectAll("g.arc")
            .data(pie(groupedData))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs
            .append("path")
            .attr("d", arc)
            .attr("fill", (d) => pieColors(d.data[0]))
            .on("mouseover", (event, d) => {
                const total = d3.sum(groupedData, (x) => x[1]);
                const percent = ((d.data[1] / total) * 100).toFixed(2);
                tooltip
                    .html(
                        `<strong>${d.data[0]}</strong><br/>
           ${metric.replace("Total", "")}: ${d.data[1].toLocaleString()}<br/>
           (${percent}%)`
                    )
                    .style("opacity", 1);
                d3.select(event.currentTarget).attr("opacity", 0.7);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", (event) => {
                tooltip.style("opacity", 0);
                d3.select(event.currentTarget).attr("opacity", 1);
            });

        arcs
            .append("text")
            .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "var(--text-light)") // THIS LINE WAS THE ISSUE
            .text((d) => d.data[0]); // This line should follow immediately without a semicolon

        // Chart Title
        svg
            .append("text")
            .attr("x", width / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .style("font-size", "1.125rem")
            .style("font-weight", "bold")
            .style("fill", "var(--text-dark)")
            .text(`${metric.replace("Total", "")} by Continent`);
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
    }, [data, metric]);

    return (
        <div ref={containerRef} className="w-full flex flex-col items-center justify-center min-h-[400px]">
            <div className="mb-8 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <label htmlFor="metric-select" className="font-medium ">Select Metric:</label>
                <select
                    id="metric-select"
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className="p-2 border border-blue-400 dark:border-blue-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                >
                    <option value="TotalCases">Total Cases</option>
                    <option value="TotalDeaths">Total Deaths</option>
                    <option value="TotalRecovered">Total Recovered</option>
                    <option value="Population">Population</option>
                </select>
            </div>
            <svg ref={svgRef}></svg>
            <div ref={tooltipRef} className="z-50"></div>
        </div>
    );
};

export default ContinentPieChart;