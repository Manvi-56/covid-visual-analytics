// import React, { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import * as d3 from "d3";
// import Card from "../../ui/Card";
// import StatCard from "../../ui/StatCard";
// import Button from "../../ui/Button";
// import "./india.css";

// const IndiaCovidMap = ({ data }) => {
//   const svgRef = useRef();
//   const [metric, setMetric] = useState("Confirmed");

//   if (!data || data.length === 0) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="text-center text-secondary-500 dark:text-secondary-400">
//           <div className="text-4xl mb-4">🇮🇳</div>
//           <p className="text-lg">Loading India COVID-19 data...</p>
//         </div>
//       </div>
//     );
//   }

//   // Calculate key metrics
//   const totalConfirmed = data.reduce((sum, item) => sum + (parseInt(item.Confirmed) || 0), 0);
//   const totalActive = data.reduce((sum, item) => sum + (parseInt(item.Active) || 0), 0);
//   const totalDeaths = data.reduce((sum, item) => sum + (parseInt(item.Deaths) || 0), 0);
//   const totalRecovered = totalConfirmed - totalActive - totalDeaths;
  
//   // Find most affected states
//   const sortedByConfirmed = [...data].sort((a, b) => (parseInt(b.Confirmed) || 0) - (parseInt(a.Confirmed) || 0));
//   const topStates = sortedByConfirmed.slice(0, 5);

//   useEffect(() => {
//     if (!data || data.length === 0) return;

//     const width = 800, height = 1000;
//     const svg = d3.select(svgRef.current)
//       .attr("width", width)
//       .attr("height", height);
//     svg.selectAll("*").remove();

//     // Enhanced color scales
//     const colorStops = {
//       Confirmed: ["#E3F2FD", "#BBDEFB", "#2196F3", "#0D47A1"],
//       Active: ["#FFF3E0", "#FFE0B2", "#FF9800", "#E65100"],
//       Deaths: ["#FFEBEE", "#FFCDD2", "#F44336", "#B71C1C"],
//     };

//     d3.json("/data/india_state.geojson")
//       .then(geoData => {
//         const projection = d3.geoMercator().fitSize([width, height], geoData);
//         const path = d3.geoPath().projection(projection);

//         const covidMap = new Map();
//         data.forEach(d => {
//           covidMap.set(d.State.toLowerCase(), {
//             Confirmed: d.Confirmed,
//             Active: d.Active,
//             Deaths: d.Deaths
//           });
//         });

//         const values = data.map(d => d[metric]);
//         const minVal = d3.min(values);
//         const maxVal = d3.max(values);

//         const color = d3.scaleLinear()
//           .domain([minVal, minVal + (maxVal - minVal) / 3, minVal + 2 * (maxVal - minVal) / 3, maxVal])
//           .range(colorStops[metric]);

//         // Create tooltip
//         const tooltip = d3.select("body").append("div")
//           .attr("class", "tooltip")
//           .style("position", "absolute")
//           .style("background", "rgba(0, 0, 0, 0.8)")
//           .style("color", "white")
//           .style("padding", "10px")
//           .style("border-radius", "8px")
//           .style("pointer-events", "none")
//           .style("opacity", 0)
//           .style("font-size", "12px")
//           .style("z-index", "1000");

//         // Draw states
//         svg.selectAll("path")
//           .data(geoData.features)
//           .enter()
//           .append("path")
//           .attr("d", path)
//           .attr("fill", d => {
//             const stateName = d.properties.NAME_1 || d.properties.state || d.properties.NAME;
//             const stateData = covidMap.get(stateName?.toLowerCase());
//             return stateData ? color(stateData[metric]) : "#f0f0f0";
//           })
//           .attr("stroke", "#333")
//           .attr("stroke-width", 0.5)
//           .style("cursor", "pointer")
//           .on("mouseover", function(event, d) {
//             const stateName = d.properties.NAME_1 || d.properties.state || d.properties.NAME;
//             const stateData = covidMap.get(stateName?.toLowerCase());
            
//             d3.select(this)
//               .attr("stroke-width", 2)
//               .attr("stroke", "#000");

//             tooltip.transition().duration(200).style("opacity", 1);
//             tooltip.html(`
//               <strong>${stateName}</strong><br/>
//               Confirmed: ${stateData?.Confirmed || 'N/A'}<br/>
//               Active: ${stateData?.Active || 'N/A'}<br/>
//               Deaths: ${stateData?.Deaths || 'N/A'}
//             `)
//             .style("left", (event.pageX + 10) + "px")
//             .style("top", (event.pageY - 10) + "px");
//           })
//           .on("mouseout", function() {
//             d3.select(this)
//               .attr("stroke-width", 0.5)
//               .attr("stroke", "#333");
            
//             tooltip.transition().duration(200).style("opacity", 0);
//           });

//         // Add legend
//         const legend = svg.append("g")
//           .attr("transform", "translate(20, 20)");

//         const legendScale = d3.scaleLinear()
//           .domain([minVal, maxVal])
//           .range([0, 200]);

//         const legendAxis = d3.axisBottom(legendScale)
//           .ticks(4)
//           .tickFormat(d3.format(".2s"));

//         // Legend gradient
//         const defs = svg.append("defs");
//         const gradient = defs.append("linearGradient")
//           .attr("id", "legend-gradient");

//         colorStops[metric].forEach((color, i) => {
//           gradient.append("stop")
//             .attr("offset", `${(i / (colorStops[metric].length - 1)) * 100}%`)
//             .attr("stop-color", color);
//         });

//         legend.append("rect")
//           .attr("width", 200)
//           .attr("height", 20)
//           .style("fill", "url(#legend-gradient)");

//         legend.append("g")
//           .attr("transform", "translate(0, 20)")
//           .call(legendAxis);

//         legend.append("text")
//           .attr("x", 100)
//           .attr("y", -5)
//           .attr("text-anchor", "middle")
//           .style("font-size", "12px")
//           .style("font-weight", "bold")
//           .text(metric);

//         return () => {
//           tooltip.remove();
//         };
//       })
//       .catch(error => {
//         console.error("Error loading GeoJSON:", error);
//       });
//   }, [data, metric]);

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { 
//       opacity: 1, 
//       y: 0,
//       transition: { duration: 0.5 }
//     }
//   };

//   return (
//     <motion.div 
//       className="space-y-8"
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//     >
//       {/* India Overview Metrics */}
//       <motion.div variants={itemVariants}>
//         <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center gap-2">
//           <span>🇮🇳</span>
//           India COVID-19 Analysis
//         </h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <StatCard
//             title="Total Confirmed"
//             value={totalConfirmed.toLocaleString()}
//             icon="📊"
//             color="covid.cases"
//             size="sm"
//             subtitle="All confirmed cases"
//           />
//           <StatCard
//             title="Active Cases"
//             value={totalActive.toLocaleString()}
//             icon="🔄"
//             color="covid.active"
//             size="sm"
//             subtitle="Currently active"
//           />
//           <StatCard
//             title="Deaths"
//             value={totalDeaths.toLocaleString()}
//             icon="💔"
//             color="covid.deaths"
//             size="sm"
//             subtitle="Total fatalities"
//           />
//           <StatCard
//             title="Recovered"
//             value={totalRecovered.toLocaleString()}
//             icon="💚"
//             color="covid.recovered"
//             size="sm"
//             subtitle="Total recovered"
//           />
//         </div>
//       </motion.div>

//       {/* Map and Controls */}
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//         {/* Interactive Map */}
//         <motion.div variants={itemVariants} className="lg:col-span-3">
//           <Card>
//             <Card.Header>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <Card.Title className="flex items-center gap-2">
//                     <span>🗺️</span>
//                     Interactive State-wise Analysis
//                   </Card.Title>
//                   <Card.Description>
//                     Hover over states to see detailed COVID-19 statistics
//                   </Card.Description>
//                 </div>
//                 <div className="flex gap-2">
//                   {['Confirmed', 'Active', 'Deaths'].map((metricOption) => (
//                     <Button
//                       key={metricOption}
//                       variant={metric === metricOption ? 'primary' : 'outline'}
//                       size="sm"
//                       onClick={() => setMetric(metricOption)}
//                     >
//                       {metricOption}
//                     </Button>
//                   ))}
//                 </div>
//               </div>
//             </Card.Header>
//             <Card.Content className="flex justify-center p-4">
//               <div className="overflow-auto">
//                 <svg ref={svgRef}></svg>
//               </div>
//             </Card.Content>
//           </Card>
//         </motion.div>

//         {/* Top States List */}
//         <motion.div variants={itemVariants}>
//           <Card className="h-full">
//             <Card.Header>
//               <Card.Title className="flex items-center gap-2">
//                 <span>🏆</span>
//                 Most Affected States
//               </Card.Title>
//               <Card.Description>
//                 Top 5 states by confirmed cases
//               </Card.Description>
//             </Card.Header>
//             <Card.Content className="space-y-4">
//               {topStates.map((state, index) => (
//                 <div key={state.State} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
//                       {index + 1}
//                     </div>
//                     <div>
//                       <div className="font-semibold text-sm">{state.State}</div>
//                       <div className="text-xs text-secondary-500 dark:text-secondary-400">
//                         Active: {parseInt(state.Active).toLocaleString()}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="font-bold text-sm">{parseInt(state.Confirmed).toLocaleString()}</div>
//                     <div className="text-xs text-secondary-500 dark:text-secondary-400">confirmed</div>
//                   </div>
//                 </div>
//               ))}
//             </Card.Content>
//           </Card>
//         </motion.div>
//       </div>

//       {/* Key Insights */}
//       <motion.div variants={itemVariants}>
//         <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-800 border-primary-200 dark:border-primary-800">
//           <Card.Header>
//             <Card.Title className="flex items-center gap-2 text-primary-800 dark:text-primary-200">
//               <span>💡</span>
//               India-Specific Insights
//             </Card.Title>
//           </Card.Header>
//           <Card.Content>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div className="text-center p-4 bg-white/50 dark:bg-secondary-800/50 rounded-xl border border-primary-200 dark:border-primary-700">
//                 <div className="text-2xl mb-2">🏙️</div>
//                 <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Urban Concentration</h4>
//                 <p className="text-sm text-secondary-600 dark:text-secondary-400">
//                   Major metropolitan areas show higher case concentrations due to population density and connectivity.
//                 </p>
//               </div>
//               <div className="text-center p-4 bg-white/50 dark:bg-secondary-800/50 rounded-xl border border-primary-200 dark:border-primary-700">
//                 <div className="text-2xl mb-2">🌾</div>
//                 <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Rural Impact</h4>
//                 <p className="text-sm text-secondary-600 dark:text-secondary-400">
//                   Rural states show different patterns, often with delayed but significant impact waves.
//                 </p>
//               </div>
//               <div className="text-center p-4 bg-white/50 dark:bg-secondary-800/50 rounded-xl border border-primary-200 dark:border-primary-700">
//                 <div className="text-2xl mb-2">💉</div>
//                 <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Vaccination Drive</h4>
//                 <p className="text-sm text-secondary-600 dark:text-secondary-400">
//                   India's massive vaccination campaign has been crucial in managing the pandemic's progression.
//                 </p>
//               </div>
//             </div>
//           </Card.Content>
//         </Card>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default IndiaCovidMap;


import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./india.css";

function IndiaCovidMap({ data }) {
  const [geoData, setGeoData] = useState(null);
  const [metric, setMetric] = useState("Confirmed");
  const svgRef = useRef();

  // Debug logging
  useEffect(() => {
    console.log("IndiaCovidMap received data:", data);
    if (data && data.length > 0) {
      console.log("First data item:", data[0]);
      console.log("Available columns:", Object.keys(data[0]));
    }
  }, [data]);

  useEffect(() => {
    // Load GeoJSON data for Indian states
    d3.json("/data/india_state.geojson")
      .then((data) => {
        console.log("GeoJSON loaded:", data);
        setGeoData(data);
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
      });
  }, []);

  // Draw map when geoData and data are available
  useEffect(() => {
    if (!geoData || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr("width", width).attr("height", height);

    // Create projection for India
    const projection = d3.geoMercator()
      .center([78.9629, 20.5937]) // Center of India
      .scale(1000)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Create color scale based on selected metric
    const dataValues = data.map(d => parseNumber(d[metric])).filter(v => v > 0);
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(dataValues)])
      .interpolator(d3.interpolateOrRd);

    // Create map-data lookup with flexible state name matching
    const stateDataMap = new Map();
    data.forEach(d => {
      const stateName = d.State;
      if (stateName) {
        // Create multiple variations for better matching
        const normalizedName = stateName.toLowerCase().trim();
        stateDataMap.set(normalizedName, d);
        
        // Handle common variations
        const variations = {
          'andaman and nicobar islands': ['andaman & nicobar'],
          'dadra and nagar haveli and daman and diu': ['dadra & nagar haveli', 'daman & diu'],
          'delhi': ['nct of delhi', 'national capital territory of delhi'],
          'jammu and kashmir': ['jammu & kashmir'],
          'uttarakhand': ['uttaranchal'],
        };
        
        Object.entries(variations).forEach(([key, alts]) => {
          if (normalizedName.includes(key) || key.includes(normalizedName)) {
            alts.forEach(alt => stateDataMap.set(alt, d));
          }
        });
      }
    });

    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "12px 16px")
      .style("border-radius", "8px")
      .style("font-size", "14px")
      .style("line-height", "1.4")
      .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.3)")
      .style("border", "1px solid rgba(255, 255, 255, 0.1)")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000);

    // Draw states
    svg.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        const stateName = d.properties.NAME_1 || d.properties.name || d.properties.ST_NM;
        let stateData = stateDataMap.get(stateName.toLowerCase());
        
        // Try alternative matching if first attempt fails
        if (!stateData) {
          const altName = stateName.toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/&/g, 'and')
            .trim();
          stateData = stateDataMap.get(altName);
        }
        
        if (stateData) {
          const value = parseNumber(stateData[metric]);
          return value > 0 ? colorScale(value) : "#f0f0f0";
        }
        return "#e0e0e0";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        const stateName = d.properties.NAME_1 || d.properties.name || d.properties.ST_NM;
        let stateData = stateDataMap.get(stateName.toLowerCase());
        
        // Try alternative matching if first attempt fails
        if (!stateData) {
          const altName = stateName.toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/&/g, 'and')
            .trim();
          stateData = stateDataMap.get(altName);
        }
        
        // Enhanced hover effect with black border and scale transform
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", "#000000")
          .attr("stroke-width", 2)
          .attr("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))")
          .style("transform", "scale(1.02)")
          .style("transform-origin", "center");

        // Stop any existing tooltip transitions
        tooltip.transition().duration(0);

        if (stateData) {
          const currentValue = parseNumber(stateData[metric]);
          const totalValue = data.reduce((sum, state) => sum + parseNumber(state[metric]), 0);
          const percentage = totalValue > 0 ? ((currentValue / totalValue) * 100).toFixed(1) : 0;
          
          // Get metric display name and color
          const metricInfo = {
            'Confirmed': { name: 'Total Cases', color: '#3b82f6', icon: '📊' },
            'Active': { name: 'Active Cases', color: '#ef4444', icon: '🔄' },
            'Deaths': { name: 'Deaths', color: '#6b7280', icon: '💔' },
            'Recovered': { name: 'Recovered', color: '#10b981', icon: '✅' },
            'CaseFatalityRate': { name: 'Case Fatality Rate', color: '#f59e0b', icon: '📈' }
          };
          
          const info = metricInfo[metric] || { name: metric, color: '#6b7280', icon: '📊' };
          
          tooltip
            .html(`
              <div style="
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.4;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                min-width: 200px;
              ">
                <div style="font-weight: 600; margin-bottom: 8px; color: #ffffff;">
                  ${stateName}
                </div>
                <div style="margin-bottom: 4px;">
                  <span style="color: ${info.color};">●</span> ${info.name}: <strong>${metric === 'CaseFatalityRate' ? (currentValue || 0).toFixed(2) + '%' : currentValue.toLocaleString()}</strong>
                </div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.2); color: #d1d5db;">
                  ${percentage}% of total ${info.name.toLowerCase()}
                </div>
              </div>
            `)
            .style("opacity", 1)
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 60) + "px");
        } else {
          tooltip
            .html(`
              <div style="
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.4;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                min-width: 180px;
              ">
                <div style="font-weight: 600; margin-bottom: 8px; color: #ffffff;">
                  ${stateName}
                </div>
                <div style="color: #9ca3af;">
                  No data available
                </div>
              </div>
            `)
            .style("opacity", 1)
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 60) + "px");
        }
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 20) + "px")
          .style("top", (event.pageY - 60) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("filter", null)
          .style("transform", "scale(1)")
          .style("transform-origin", "center");
        
        // Add a small delay before hiding tooltip to prevent flickering
        tooltip
          .transition()
          .delay(50)
          .duration(200)
          .style("opacity", 0);
      })
      .on("click", function(event, d) {
        // Click functionality disabled - only hover tooltips
        console.log("State clicked:", d.properties.NAME_1 || d.properties.name || d.properties.ST_NM);
      });

    // Cleanup function
    return () => {
      d3.selectAll(".d3-tooltip").remove();
    };

  }, [geoData, data, metric]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <div className="text-4xl mb-4">🇮🇳</div>
          <p className="text-lg">Loading India state data...</p>
        </div>
      </div>
    );
  }

  // Safe number parsing function
  const parseNumber = (value) => {
    if (typeof value === 'string') {
      return parseInt(value.replace(/,/g, '') || 0);
    }
    return parseInt(value || 0);
  };

  // Calculate metrics from the data
  const totalCases = data.reduce((sum, state) => sum + parseNumber(state.Confirmed), 0);
  const totalDeaths = data.reduce((sum, state) => sum + parseNumber(state.Deaths), 0);
  const totalRecovered = data.reduce((sum, state) => sum + parseNumber(state.Recovered), 0);
  const totalActive = data.reduce((sum, state) => sum + parseNumber(state.Active), 0);

  const mortalityRate = totalCases > 0 ? ((totalDeaths / totalCases) * 100).toFixed(2) : 0;
  const recoveryRate = totalCases > 0 ? ((totalRecovered / totalCases) * 100).toFixed(2) : 0;

  // Get top 5 states by cases
  const topStates = [...data]
    .sort((a, b) => parseNumber(b.Confirmed) - parseNumber(a.Confirmed))
    .slice(0, 5);

  return (
    <div className="space-y-8">

      {/* India Overview Metrics */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <span>🇮🇳</span>
          India COVID-19 State Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">😷</span>
              <div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Cases</div>
                <div className="text-xl font-bold text-orange-600">{totalCases.toLocaleString()}</div>
                <div className="text-xs text-slate-500">Confirmed infections</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚨</span>
              <div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Cases</div>
                <div className="text-xl font-bold text-red-600">{totalActive.toLocaleString()}</div>
                <div className="text-xs text-slate-500">Currently infected</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Recovered</div>
                <div className="text-xl font-bold text-green-600">{totalRecovered.toLocaleString()}</div>
                <div className="text-xs text-slate-500">{recoveryRate}% recovery rate</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💔</span>
              <div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Deaths</div>
                <div className="text-xl font-bold text-gray-600">{totalDeaths.toLocaleString()}</div>
                <div className="text-xs text-slate-500">{mortalityRate}% mortality rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Map */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🗺️</span>
              Interactive State Map
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Click on states to view detailed COVID-19 statistics
            </p>
            <div className="mt-3 flex items-center gap-4">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Color by:</label>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
              >
                <option value="Confirmed">Total Cases</option>
                <option value="Active">Active Cases</option>
                <option value="Deaths">Deaths</option>
                <option value="Recovered">Recovered</option>
                <option value="CaseFatalityRate">Case Fatality Rate (%)</option>
              </select>
            </div>
          </div>
          <div className="p-6 w-full flex justify-center">
            {geoData ? (
              <div className="relative w-full">
                <svg ref={svgRef} className="w-full"></svg>
              </div>
            ) : (
              <div className="aspect-square max-w-md mx-auto bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="text-sm">Loading India Map...</p>
                  <p className="text-xs text-slate-400 mt-1">Please wait...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top States Leaderboard */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🏆</span>
              Top Affected States
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              States with highest case counts
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topStates.map((state, index) => (
                <div 
                  key={state.State_UT || state.State || index} 
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-bold text-orange-600 dark:text-orange-400">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {state.State}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {parseNumber(state.Confirmed).toLocaleString()} cases
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {((parseNumber(state.Confirmed) / totalCases) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Regional Insights */}
      <div className="bg-gradient-to-br from-green-50 to-slate-50 dark:from-green-900/20 dark:to-slate-800 rounded-2xl shadow-lg border border-green-200 dark:border-green-800 overflow-hidden">
        <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-b border-green-200 dark:border-green-700">
          <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
            <span>🔍</span>
            Regional Analysis Insights
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-green-200 dark:border-green-700">
              <div className="text-2xl mb-2">🏙️</div>
              <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">Urban Hotspots</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Major metropolitan areas show higher case concentrations due to population density and mobility.
              </p>
            </div>
            <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-green-200 dark:border-green-700">
              <div className="text-2xl mb-2">🏥</div>
              <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">Healthcare Capacity</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                States with better healthcare infrastructure show improved recovery rates and lower mortality.
              </p>
            </div>
            <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-green-200 dark:border-green-700">
              <div className="text-2xl mb-2">📊</div>
              <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">Testing Efficiency</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Higher testing rates in certain states enable better case detection and contact tracing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IndiaCovidMap;