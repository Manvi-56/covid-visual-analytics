// src/components/data2/page1/TestLineChart.js
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const TestsPerMillionLineChart = ({ data }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const containerRef = useRef(); // New ref for the container div
    const [continent, setContinent] = useState("All");

    const continents = Array.from(new Set(data.map(d => d.Continent).filter(Boolean)));

    const drawChart = () => {
        if (!data || data.length === 0 || !containerRef.current) return;

        const containerWidth = containerRef.current.clientWidth;

        const margin = { top: 50, right: 30, bottom: 160, left: 70 };
        // Make width responsive based on container width, with a min-width
        const width = Math.max(containerWidth - margin.left - margin.right, 700);
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        // Clear previous elements before drawing
        svg.selectAll("*").remove();

        const g = svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const tooltip = d3.select(tooltipRef.current)
            // Apply Tailwind classes for tooltip styling
            .attr("class", "absolute p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg pointer-events-none transition-opacity duration-200")
            .style("opacity", 0); // Start hidden

        // Clean and prepare data
        const cleaned = data
            .map(d => ({
                country: d["Country"] || d["Country/Region"],
                testsPerMillion: +d["TestsPerMillion"] || +d["Tests/1M pop"],
                continent: d.Continent
            }))
            .filter(d => d.country && !isNaN(d.testsPerMillion) && (continent === "All" || d.continent === continent));

        const x = d3.scaleBand()
            .domain(cleaned.map(d => d.country))
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(cleaned, d => d.testsPerMillion) * 1.1])
            .range([height, 0]);

        // Y-axis with grid
        g.append("g")
            .call(d3.axisLeft(y).ticks(10).tickFormat(d3.format(",")).tickSize(-width))
            .style("font-size", "11px") // Apply font size
            .selectAll("text")
            .style("fill", "var(--text-dark)"); // Apply text color for dark mode

        g.selectAll(".tick line") // Select grid lines specifically
            .attr("stroke", "var(--border-color)") // Use CSS variable for border/grid color
            .attr("stroke-dasharray", "2,2");

        g.selectAll("path.domain")
            .attr("stroke", "var(--text-dark)"); // Apply color to axis line


        // X-axis
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -5)
            .attr("y", x.bandwidth() / 2)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .style("font-size", "10px")
            .style("fill", "var(--text-dark)"); // Apply text color for dark mode

        // Lines and circles
        g.selectAll("line.spike")
            .data(cleaned)
            .enter()
            .append("line")
            .attr("x1", d => x(d.country) + x.bandwidth() / 2)
            .attr("x2", d => x(d.country) + x.bandwidth() / 2)
            .attr("y1", height)
            .attr("y2", d => y(d.testsPerMillion))
            .attr("stroke", "var(--primary-color)") // Use CSS variable for line color
            .attr("stroke-width", 2);

        g.selectAll("circle")
            .data(cleaned)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.country) + x.bandwidth() / 2)
            .attr("cy", d => y(d.testsPerMillion))
            .attr("r", 3)
            .attr("fill", "var(--primary-color)") // Use CSS variable for circle color
            .on("mouseover", (event, d) => {
                tooltip
                    .html(`<strong>${d.country}</strong><br/>Tests/1M: ${d.testsPerMillion.toLocaleString()}`)
                    .style("opacity", 1); // Make visible
                d3.select(event.currentTarget).attr("fill", "var(--hover-color)"); // Use hover color
            })
            .on("mousemove", event => {
                tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", event => {
                tooltip.style("opacity", 0); // Hide
                d3.select(event.currentTarget).attr("fill", "var(--primary-color)"); // Restore original color
            });

        // Title and axis labels
        svg.append("text")
            .attr("x", width / 2 + margin.left)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "1.125rem") // Tailwind text-xl
            .style("font-weight", "bold")
            .style("fill", "var(--text-dark)") // Apply text color for dark mode
            .text("Tests Per Million by Country");

        svg.append("text")
            .attr("x", width / 2 + margin.left)
            .attr("y", height + margin.top + 110)
            .attr("text-anchor", "middle")
            .style("font-size", "0.875rem") // Tailwind text-sm
            .style("fill", "var(--text-dark)") // Apply text color for dark mode
            .text("Country/Region");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height / 2) - margin.top)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "0.875rem") // Tailwind text-sm
            .style("fill", "var(--text-dark)") // Apply text color for dark mode
            .text("Tests/1M pop");
    };

    useEffect(() => {
        drawChart(); // Initial draw

        // Setup ResizeObserver
        const resizeObserver = new ResizeObserver(() => {
            // Clear existing chart elements before redraw
            d3.select(svgRef.current).selectAll("*").remove();
            drawChart(); // Redraw chart on resize
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Cleanup function: This runs when the component unmounts OR before the effect re-runs
        return () => {
            d3.select(svgRef.current).selectAll("*").remove(); // Remove all D3 elements
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current); // Disconnect observer
            }
        };
    }, [data, continent]); // Redraw chart if data or continent changes

    return (
        // Add ref to the parent div and apply Tailwind classes
        <div ref={containerRef} className="w-full flex flex-col items-center justify-center min-h-[600px] p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {/* Filter UI - applying Tailwind classes */}
            <div className="mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <label htmlFor="continent-select" className="font-medium">Filter by Continent:</label>
                <select
                    id="continent-select"
                    onChange={e => setContinent(e.target.value)}
                    value={continent}
                    className="p-2 border border-blue-400 dark:border-blue-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                >
                    <option value="All">All</option>
                    {continents.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
            <svg ref={svgRef} className="block"></svg> {/* block display for svg */}
            <div ref={tooltipRef} className="z-50"></div> {/* Ensure tooltip is on top */}
        </div>
    );
};

export default TestsPerMillionLineChart;