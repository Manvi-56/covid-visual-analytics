import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import Card from "../../ui/Card";
import StatCard from "../../ui/StatCard";
import Button from "../../ui/Button";
import "./india.css";

const IndiaCovidMap = ({ data }) => {
  const svgRef = useRef();
  const [metric, setMetric] = useState("Confirmed");

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center text-secondary-500 dark:text-secondary-400">
          <div className="text-4xl mb-4">🇮🇳</div>
          <p className="text-lg">Loading India COVID-19 data...</p>
        </div>
      </div>
    );
  }

  // Calculate key metrics
  const totalConfirmed = data.reduce((sum, item) => sum + (parseInt(item.Confirmed) || 0), 0);
  const totalActive = data.reduce((sum, item) => sum + (parseInt(item.Active) || 0), 0);
  const totalDeaths = data.reduce((sum, item) => sum + (parseInt(item.Deaths) || 0), 0);
  const totalRecovered = totalConfirmed - totalActive - totalDeaths;
  
  // Find most affected states
  const sortedByConfirmed = [...data].sort((a, b) => (parseInt(b.Confirmed) || 0) - (parseInt(a.Confirmed) || 0));
  const topStates = sortedByConfirmed.slice(0, 5);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 800, height = 1000;
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    svg.selectAll("*").remove();

    // Enhanced color scales
    const colorStops = {
      Confirmed: ["#E3F2FD", "#BBDEFB", "#2196F3", "#0D47A1"],
      Active: ["#FFF3E0", "#FFE0B2", "#FF9800", "#E65100"],
      Deaths: ["#FFEBEE", "#FFCDD2", "#F44336", "#B71C1C"],
    };

    d3.json("/data/india_state.geojson")
      .then(geoData => {
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

        const color = d3.scaleLinear()
          .domain([minVal, minVal + (maxVal - minVal) / 3, minVal + 2 * (maxVal - minVal) / 3, maxVal])
          .range(colorStops[metric]);

        // Create tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "10px")
          .style("border-radius", "8px")
          .style("pointer-events", "none")
          .style("opacity", 0)
          .style("font-size", "12px")
          .style("z-index", "1000");

        // Draw states
        svg.selectAll("path")
          .data(geoData.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", d => {
            const stateName = d.properties.NAME_1 || d.properties.state || d.properties.NAME;
            const stateData = covidMap.get(stateName?.toLowerCase());
            return stateData ? color(stateData[metric]) : "#f0f0f0";
          })
          .attr("stroke", "#333")
          .attr("stroke-width", 0.5)
          .style("cursor", "pointer")
          .on("mouseover", function(event, d) {
            const stateName = d.properties.NAME_1 || d.properties.state || d.properties.NAME;
            const stateData = covidMap.get(stateName?.toLowerCase());
            
            d3.select(this)
              .attr("stroke-width", 2)
              .attr("stroke", "#000");

            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`
              <strong>${stateName}</strong><br/>
              Confirmed: ${stateData?.Confirmed || 'N/A'}<br/>
              Active: ${stateData?.Active || 'N/A'}<br/>
              Deaths: ${stateData?.Deaths || 'N/A'}
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
          })
          .on("mouseout", function() {
            d3.select(this)
              .attr("stroke-width", 0.5)
              .attr("stroke", "#333");
            
            tooltip.transition().duration(200).style("opacity", 0);
          });

        // Add legend
        const legend = svg.append("g")
          .attr("transform", "translate(20, 20)");

        const legendScale = d3.scaleLinear()
          .domain([minVal, maxVal])
          .range([0, 200]);

        const legendAxis = d3.axisBottom(legendScale)
          .ticks(4)
          .tickFormat(d3.format(".2s"));

        // Legend gradient
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
          .attr("id", "legend-gradient");

        colorStops[metric].forEach((color, i) => {
          gradient.append("stop")
            .attr("offset", `${(i / (colorStops[metric].length - 1)) * 100}%`)
            .attr("stop-color", color);
        });

        legend.append("rect")
          .attr("width", 200)
          .attr("height", 20)
          .style("fill", "url(#legend-gradient)");

        legend.append("g")
          .attr("transform", "translate(0, 20)")
          .call(legendAxis);

        legend.append("text")
          .attr("x", 100)
          .attr("y", -5)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .text(metric);

        return () => {
          tooltip.remove();
        };
      })
      .catch(error => {
        console.error("Error loading GeoJSON:", error);
      });
  }, [data, metric]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* India Overview Metrics */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center gap-2">
          <span>🇮🇳</span>
          India COVID-19 Analysis
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Confirmed"
            value={totalConfirmed.toLocaleString()}
            icon="📊"
            color="covid.cases"
            size="sm"
            subtitle="All confirmed cases"
          />
          <StatCard
            title="Active Cases"
            value={totalActive.toLocaleString()}
            icon="🔄"
            color="covid.active"
            size="sm"
            subtitle="Currently active"
          />
          <StatCard
            title="Deaths"
            value={totalDeaths.toLocaleString()}
            icon="💔"
            color="covid.deaths"
            size="sm"
            subtitle="Total fatalities"
          />
          <StatCard
            title="Recovered"
            value={totalRecovered.toLocaleString()}
            icon="💚"
            color="covid.recovered"
            size="sm"
            subtitle="Total recovered"
          />
        </div>
      </motion.div>

      {/* Map and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Interactive Map */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <Card.Title className="flex items-center gap-2">
                    <span>🗺️</span>
                    Interactive State-wise Analysis
                  </Card.Title>
                  <Card.Description>
                    Hover over states to see detailed COVID-19 statistics
                  </Card.Description>
                </div>
                <div className="flex gap-2">
                  {['Confirmed', 'Active', 'Deaths'].map((metricOption) => (
                    <Button
                      key={metricOption}
                      variant={metric === metricOption ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setMetric(metricOption)}
                    >
                      {metricOption}
                    </Button>
                  ))}
                </div>
              </div>
            </Card.Header>
            <Card.Content className="flex justify-center p-4">
              <div className="overflow-auto">
                <svg ref={svgRef}></svg>
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Top States List */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <span>🏆</span>
                Most Affected States
              </Card.Title>
              <Card.Description>
                Top 5 states by confirmed cases
              </Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              {topStates.map((state, index) => (
                <div key={state.State} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{state.State}</div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">
                        Active: {parseInt(state.Active).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{parseInt(state.Confirmed).toLocaleString()}</div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400">confirmed</div>
                  </div>
                </div>
              ))}
            </Card.Content>
          </Card>
        </motion.div>
      </div>

      {/* Key Insights */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-800 border-primary-200 dark:border-primary-800">
          <Card.Header>
            <Card.Title className="flex items-center gap-2 text-primary-800 dark:text-primary-200">
              <span>💡</span>
              India-Specific Insights
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/50 dark:bg-secondary-800/50 rounded-xl border border-primary-200 dark:border-primary-700">
                <div className="text-2xl mb-2">🏙️</div>
                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Urban Concentration</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Major metropolitan areas show higher case concentrations due to population density and connectivity.
                </p>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-secondary-800/50 rounded-xl border border-primary-200 dark:border-primary-700">
                <div className="text-2xl mb-2">🌾</div>
                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Rural Impact</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Rural states show different patterns, often with delayed but significant impact waves.
                </p>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-secondary-800/50 rounded-xl border border-primary-200 dark:border-primary-700">
                <div className="text-2xl mb-2">💉</div>
                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Vaccination Drive</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  India's massive vaccination campaign has been crucial in managing the pandemic's progression.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default IndiaCovidMap;

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
