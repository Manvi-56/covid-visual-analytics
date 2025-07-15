import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const PopulationVsCasesScatter = ({ data }) => {
  const svgRef = useRef();
  const mapRef = useRef();
  const [viewMode, setViewMode] = useState("casesPerMillion");
  const [continentFilter, setContinentFilter] = useState("All");
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [worldData, setWorldData] = useState(null);

  useEffect(() => {
    // Load world map data
    const loadWorldData = async () => {
      try {
        console.log('Loading world map data...');
        const response = await fetch('https://raw.githubusercontent.com/topojson/world-atlas/master/countries-110m.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const worldTopology = await response.json();
        console.log('World topology loaded:', worldTopology);
        
        // Validate the data structure
        if (worldTopology.objects && worldTopology.objects.countries) {
          setWorldData(worldTopology);
          console.log('World data set successfully');
        } else {
          console.warn('Invalid world data structure:', Object.keys(worldTopology));
          throw new Error('Invalid world data structure');
        }
      } catch (error) {
        console.error('Error loading world map data:', error);
        
        // Try alternative source
        try {
          console.log('Trying alternative world map source...');
          const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const worldTopology = await response.json();
          console.log('Alternative world topology loaded:', worldTopology);
          
          // Validate the data structure
          if (worldTopology.objects && worldTopology.objects.countries) {
            setWorldData(worldTopology);
            console.log('Alternative world data set successfully');
          } else {
            console.warn('Invalid alternative world data structure:', Object.keys(worldTopology));
            throw new Error('Invalid alternative world data structure');
          }
        } catch (error2) {
          console.error('Error loading alternative world map data:', error2);
          
          // Try third alternative
          try {
            console.log('Trying third alternative world map source...');
            const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@3/countries-110m.json');
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const worldTopology = await response.json();
            console.log('Third alternative world topology loaded:', worldTopology);
            
            // Validate the data structure
            if (worldTopology.objects && worldTopology.objects.countries) {
              setWorldData(worldTopology);
              console.log('Third alternative world data set successfully');
            } else {
              console.warn('Invalid third alternative world data structure:', Object.keys(worldTopology));
              throw new Error('Invalid third alternative world data structure');
            }
          } catch (error3) {
            console.error('Error loading third alternative world map data:', error3);
            
            // Create a simple fallback message
            setWorldData({ error: 'Failed to load world map data from all sources' });
          }
        }
      }
    };
    
    loadWorldData();
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 80, right: 200, bottom: 90, left: 90 };
    const width = 1200 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const cleaned = data
      .map(d => ({
        country: d["Country"] || d["Country/Region"] || d.location || 'Unknown',
        population: +d["Population"] || 0,
        totalCases: +d["TotalCases"] || 0,
        totalDeaths: +d["TotalDeaths"] || 0,
        totalRecovered: +d["TotalRecovered"] || 0,
        continent: d["Continent"] || d["WHORegion"] || 'Unknown',
      }))
      .filter(d => d.country && d.population > 0 && d.totalCases > 0)
      .map(d => ({
        ...d,
        casesPerMillion: (d.totalCases / d.population) * 1000000,
        deathsPerMillion: (d.totalDeaths / d.population) * 1000000,
        recoveryRate: d.totalCases > 0 ? (d.totalRecovered / d.totalCases) * 100 : 0,
        mortalityRate: d.totalCases > 0 ? (d.totalDeaths / d.totalCases) * 100 : 0,
        infectionRate: (d.totalCases / d.population) * 100,
        populationCategory: d.population > 100000000 ? 'Large (>100M)' : 
                          d.population > 10000000 ? 'Medium (10M-100M)' : 'Small (<10M)'
      }))
      .filter(d => continentFilter === "All" || d.continent === continentFilter);

    // Dynamic scales based on view mode
    let xScale, yScale, xLabel, yLabel, chartTitle;
    
    switch(viewMode) {
      case "casesPerMillion":
        xScale = d3.scaleLog()
          .domain([d3.min(cleaned, d => d.population || 1), d3.max(cleaned, d => d.population)])
          .range([0, width]);
        yScale = d3.scaleLinear()
          .domain([0, d3.max(cleaned, d => d.casesPerMillion) * 1.1])
          .range([height, 0]);
        xLabel = "Population (Log Scale)";
        yLabel = "Cases per Million";
        chartTitle = "COVID-19 Impact: Cases per Million vs Population";
        break;
        
      case "infectionRate":
        xScale = d3.scaleLinear()
          .domain([0, d3.max(cleaned, d => d.infectionRate) * 1.1])
          .range([0, width]);
        yScale = d3.scaleLinear()
          .domain([0, d3.max(cleaned, d => d.mortalityRate) * 1.1])
          .range([height, 0]);
        xLabel = "Infection Rate (% of Population)";
        yLabel = "Mortality Rate (% of Cases)";
        chartTitle = "COVID-19 Impact: Infection Rate vs Mortality Rate";
        break;
        
      case "bubble":
        xScale = d3.scaleLinear()
          .domain([0, d3.max(cleaned, d => d.casesPerMillion) * 1.1])
          .range([0, width]);
        yScale = d3.scaleLinear()
          .domain([0, d3.max(cleaned, d => d.deathsPerMillion) * 1.1])
          .range([height, 0]);
        xLabel = "Cases per Million";
        yLabel = "Deaths per Million";
        chartTitle = "COVID-19 Impact: Cases vs Deaths per Million (Bubble Size = Population)";
        break;
    }

    // Enhanced tooltip
    const tooltip = d3.select("body")
      .selectAll(".population-chart-tooltip")
      .data([null])
      .join("div")
      .attr("class", "population-chart-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(15, 23, 42, 0.95)")
      .style("color", "white")
      .style("padding", "12px 16px")
      .style("border-radius", "8px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("box-shadow", "0 10px 25px rgba(0, 0, 0, 0.3)")
      .style("backdrop-filter", "blur(10px)")
      .style("border", "1px solid rgba(255, 255, 255, 0.1)")
      .style("z-index", "9999")
      .style("transition", "opacity 0.2s ease");

    // Color scale for continents
    const continentColors = {
      "Asia": "#3b82f6",
      "Europe": "#10b981", 
      "North America": "#f59e0b",
      "South America": "#ef4444",
      "Africa": "#8b5cf6",
      "Oceania": "#06b6d4",
      "Unknown": "#6b7280"
    };

    // Size scale for bubble chart
    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(cleaned, d => d.population)])
      .range([3, 25]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10, viewMode === "casesPerMillion" ? "~s" : ".1f"))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#374151");

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(10, ".1f"))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#374151");

    // Add gridlines for better readability
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    // Data points
    const getXValue = (d) => {
      switch(viewMode) {
        case "casesPerMillion": return d.population;
        case "infectionRate": return d.infectionRate;
        case "bubble": return d.casesPerMillion;
        default: return d.population;
      }
    };

    const getYValue = (d) => {
      switch(viewMode) {
        case "casesPerMillion": return d.casesPerMillion;
        case "infectionRate": return d.mortalityRate;
        case "bubble": return d.deathsPerMillion;
        default: return d.casesPerMillion;
      }
    };

    g.selectAll("circle")
      .data(cleaned)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(getXValue(d)))
      .attr("cy", d => yScale(getYValue(d)))
      .attr("r", d => viewMode === "bubble" ? sizeScale(d.population) : 6)
      .attr("fill", d => continentColors[d.continent] || "#6b7280")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("opacity", 0.7)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke-width", 2)
          .attr("r", d => (viewMode === "bubble" ? sizeScale(d.population) : 6) + 2);

        const tooltipContent = `
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #60A5FA;">
            🏳️ ${d.country}
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #3b82f6; font-size: 14px;">●</span> 
            <span style="font-weight: 600;">Population:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${d.population.toLocaleString()}</span>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #ef4444; font-size: 14px;">●</span> 
            <span style="font-weight: 600;">Total Cases:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${d.totalCases.toLocaleString()}</span>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #10b981; font-size: 14px;">●</span> 
            <span style="font-weight: 600;">Cases per Million:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${d.casesPerMillion.toFixed(0)}</span>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #f59e0b; font-size: 14px;">●</span> 
            <span style="font-weight: 600;">Infection Rate:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${d.infectionRate.toFixed(2)}%</span>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #8b5cf6; font-size: 14px;">●</span> 
            <span style="font-weight: 600;">Mortality Rate:</span> 
            <span style="color: #F1F5F9; font-weight: bold;">${d.mortalityRate.toFixed(2)}%</span>
          </div>
          <div style="font-size: 11px; color: #94A3B8; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            📍 ${d.continent} • ${d.populationCategory}
          </div>
        `;

        tooltip
          .html(tooltipContent)
          .style("opacity", 1);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.7)
          .attr("stroke-width", 1)
          .attr("r", d => viewMode === "bubble" ? sizeScale(d.population) : 6);

        tooltip.style("opacity", 0);
      });

    // Chart title
    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#1F2937")
      .text(chartTitle);

    // Axis labels
    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 70)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#6B7280")
      .text(xLabel);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2) - margin.top)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#6B7280")
      .text(yLabel);

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + margin.left + 20}, ${margin.top + 20})`);

    legend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Continents:");

    Object.entries(continentColors).forEach(([continent, color], i) => {
      if (continent === "Unknown") return;
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${20 + i * 22})`);

      legendItem.append("circle")
        .attr("cx", 6)
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);

      legendItem.append("text")
        .attr("x", 16)
        .attr("y", 4)
        .style("font-size", "11px")
        .style("fill", "#333")
        .text(continent);
    });

    // Add trend line for better analysis
    if (viewMode !== "bubble") {
      const regression = d3.least(cleaned, d => Math.abs(d.casesPerMillion - d.deathsPerMillion));
      // Simple linear regression could be added here
    }

  }, [data, viewMode, continentFilter]);

  // World Map Effect
  useEffect(() => {
    if (!worldData || !data || data.length === 0 || !showWorldMap) return;

    const mapSvg = d3.select(mapRef.current);
    mapSvg.selectAll("*").remove();

    const mapWidth = 1200;
    const mapHeight = 600;

    // Check if there's an error in world data
    if (worldData.error) {
      mapSvg
        .attr("width", mapWidth)
        .attr("height", mapHeight)
        .append("text")
        .attr("x", mapWidth / 2)
        .attr("y", mapHeight / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#ef4444")
        .text("Unable to load world map data. Please check your internet connection.");
      return;
    }

    const projection = d3.geoNaturalEarth1()
      .scale(180)
      .translate([mapWidth / 2, mapHeight / 2]);

    const path = d3.geoPath().projection(projection);

    const mapG = mapSvg
      .attr("width", mapWidth)
      .attr("height", mapHeight)
      .append("g");

    // Process data for map (don't apply continent filter here)
    const mapData = data
      .filter(d => d.TotalCases > 0 && d.Population > 0)
      .map(d => ({
        country: d["Country"] || d["Country/Region"] || d.location || 'Unknown',
        population: +d["Population"] || 0,
        totalCases: +d["TotalCases"] || 0,
        totalDeaths: +d["TotalDeaths"] || 0,
        casesPerMillion: ((+d["TotalCases"] || 0) / (+d["Population"] || 1)) * 1000000,
        deathsPerMillion: ((+d["TotalDeaths"] || 0) / (+d["Population"] || 1)) * 1000000,
        continent: d["Continent"] || d["WHORegion"] || 'Unknown',
      }));

    // Create country lookup with multiple possible names
    const countryDataMap = new Map();
    mapData.forEach(d => {
      // Add multiple variations of country names
      const names = [
        d.country.toLowerCase(),
        d.country.toLowerCase().replace(/\s+/g, ''),
        d.country.toLowerCase().replace(/\s+/g, '_'),
        d.country.toLowerCase().replace(/_/g, ' '),
        d.country.toLowerCase().replace(/\./g, ''),
        d.country.toLowerCase().replace(/'/g, ''),
        d.country.toLowerCase().replace(/"/g, ''),
      ];
      
      names.forEach(name => {
        if (name && name !== 'unknown') {
          countryDataMap.set(name, d);
        }
      });
      
      // Add specific country name mappings
      if (d.country.toLowerCase().includes('united states') || d.country.toLowerCase().includes('usa')) {
        countryDataMap.set('united states of america', d);
      }
      if (d.country.toLowerCase().includes('united kingdom') || d.country.toLowerCase().includes('uk')) {
        countryDataMap.set('united kingdom', d);
      }
    });

    console.log('Map data loaded:', mapData.length, 'countries');
    console.log('Country map size:', countryDataMap.size);

    // Color scale based on view mode
    let colorScale, colorLabel;
    switch(viewMode) {
      case "casesPerMillion":
        colorScale = d3.scaleSequential(d3.interpolateReds)
          .domain([0, d3.max(mapData, d => d.casesPerMillion)]);
        colorLabel = "Cases per Million";
        break;
      case "infectionRate":
        colorScale = d3.scaleSequential(d3.interpolateOranges)
          .domain([0, d3.max(mapData, d => (d.totalCases / d.population) * 100)]);
        colorLabel = "Infection Rate (%)";
        break;
      case "bubble":
        colorScale = d3.scaleSequential(d3.interpolatePurples)
          .domain([0, d3.max(mapData, d => d.deathsPerMillion)]);
        colorLabel = "Deaths per Million";
        break;
      default:
        colorScale = d3.scaleSequential(d3.interpolateReds)
          .domain([0, d3.max(mapData, d => d.casesPerMillion)]);
        colorLabel = "Cases per Million";
    }

    // Draw countries
    try {
      const countries = topojson.feature(worldData, worldData.objects.countries);
      console.log('Countries features loaded:', countries.features.length);
      
      mapG.selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => {
          const possibleNames = [
            d.properties.NAME?.toLowerCase(),
            d.properties.name?.toLowerCase(),
            d.properties.NAME_EN?.toLowerCase(),
            d.properties.NAME_LONG?.toLowerCase(),
            d.properties.ADMIN?.toLowerCase(),
            d.properties.SOV_A3?.toLowerCase(),
            d.properties.ADM0_A3?.toLowerCase()
          ].filter(Boolean);
          
          let countryData = null;
          for (const name of possibleNames) {
            if (name && countryDataMap.has(name)) {
              countryData = countryDataMap.get(name);
              break;
            }
          }
          
          if (!countryData) {
            // Try partial matches
            for (const name of possibleNames) {
              if (name) {
                for (const [key, value] of countryDataMap) {
                  if (key.includes(name) || name.includes(key)) {
                    countryData = value;
                    break;
                  }
                }
                if (countryData) break;
              }
            }
          }
          
          if (!countryData) return "#f0f0f0";
          
          // Apply continent filter here for coloring
          if (continentFilter !== "All" && countryData.continent !== continentFilter) {
            return "#e5e5e5"; // Lighter gray for filtered out continents
          }
          
          switch(viewMode) {
            case "casesPerMillion":
              return colorScale(countryData.casesPerMillion);
            case "infectionRate":
              return colorScale((countryData.totalCases / countryData.population) * 100);
            case "bubble":
              return colorScale(countryData.deathsPerMillion);
            default:
              return colorScale(countryData.casesPerMillion);
          }
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          const possibleNames = [
            d.properties.NAME?.toLowerCase(),
            d.properties.name?.toLowerCase(),
            d.properties.NAME_EN?.toLowerCase(),
            d.properties.NAME_LONG?.toLowerCase(),
            d.properties.ADMIN?.toLowerCase()
          ].filter(Boolean);
          
          let countryData = null;
          for (const name of possibleNames) {
            if (name && countryDataMap.has(name)) {
              countryData = countryDataMap.get(name);
              break;
            }
          }
          
          if (countryData) {
            d3.select(this)
              .attr("stroke-width", 2)
              .attr("stroke", "#333");

            // Show tooltip
            const tooltip = d3.select("body")
              .selectAll(".world-map-tooltip")
              .data([null])
              .join("div")
              .attr("class", "world-map-tooltip")
              .style("position", "absolute")
              .style("background", "rgba(15, 23, 42, 0.95)")
              .style("color", "white")
              .style("padding", "12px 16px")
              .style("border-radius", "8px")
              .style("font-size", "13px")
              .style("pointer-events", "none")
              .style("opacity", 0)
              .style("box-shadow", "0 10px 25px rgba(0, 0, 0, 0.3)")
              .style("backdrop-filter", "blur(10px)")
              .style("border", "1px solid rgba(255, 255, 255, 0.1)")
              .style("z-index", "9999");

            const tooltipContent = `
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #60A5FA;">
                🌍 ${countryData.country}
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #3b82f6; font-size: 14px;">●</span> 
                <span style="font-weight: 600;">Population:</span> 
                <span style="color: #F1F5F9; font-weight: bold;">${countryData.population.toLocaleString()}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #ef4444; font-size: 14px;">●</span> 
                <span style="font-weight: 600;">Total Cases:</span> 
                <span style="color: #F1F5F9; font-weight: bold;">${countryData.totalCases.toLocaleString()}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #10b981; font-size: 14px;">●</span> 
                <span style="font-weight: 600;">Cases per Million:</span> 
                <span style="color: #F1F5F9; font-weight: bold;">${countryData.casesPerMillion.toFixed(0)}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #8b5cf6; font-size: 14px;">●</span> 
                <span style="font-weight: 600;">Deaths per Million:</span> 
                <span style="color: #F1F5F9; font-weight: bold;">${countryData.deathsPerMillion.toFixed(0)}</span>
              </div>
              <div style="font-size: 11px; color: #94A3B8; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                📍 ${countryData.continent}
              </div>
            `;

            tooltip
              .html(tooltipContent)
              .style("opacity", 1)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 10) + "px");
          } else {
            // Show country name even if no data
            d3.select(this)
              .attr("stroke-width", 2)
              .attr("stroke", "#666");
              
            const tooltip = d3.select("body")
              .selectAll(".world-map-tooltip")
              .data([null])
              .join("div")
              .attr("class", "world-map-tooltip")
              .style("position", "absolute")
              .style("background", "rgba(15, 23, 42, 0.95)")
              .style("color", "white")
              .style("padding", "12px 16px")
              .style("border-radius", "8px")
              .style("font-size", "13px")
              .style("pointer-events", "none")
              .style("opacity", 0)
              .style("z-index", "9999");

            tooltip
              .html(`<div style="font-weight: bold; color: #60A5FA;">🌍 ${d.properties.NAME || d.properties.name || 'Unknown'}</div><div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">No COVID-19 data available</div>`)
              .style("opacity", 1)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 10) + "px");
          }
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("stroke-width", 0.5)
            .attr("stroke", "#fff");

          d3.selectAll(".world-map-tooltip").style("opacity", 0);
        });

      // Add title
      mapSvg.append("text")
        .attr("x", mapWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#1F2937")
        .text(`COVID-19 World Map: ${colorLabel}`);

      // Add legend
      const legendWidth = 300;
      const legendHeight = 20;
      const legendX = mapWidth - legendWidth - 50;
      const legendY = mapHeight - 80;

      const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, legendWidth]);

      const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d3.format(".0f"));

      // Create gradient for legend
      const defs = mapSvg.append("defs");
      const gradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

      const numStops = 10;
      for (let i = 0; i <= numStops; i++) {
        const offset = (i / numStops) * 100;
        const value = colorScale.domain()[0] + (colorScale.domain()[1] - colorScale.domain()[0]) * (i / numStops);
        gradient.append("stop")
          .attr("offset", offset + "%")
          .attr("stop-color", colorScale(value));
      }

      // Draw legend
      const legend = mapSvg.append("g")
        .attr("transform", `translate(${legendX}, ${legendY})`);

      legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")
        .style("stroke", "#333")
        .style("stroke-width", 1);

      legend.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis)
        .selectAll("text")
        .style("font-size", "11px");

      legend.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(colorLabel);

    } catch (error) {
      console.error('Error rendering world map:', error);
      
      // Show error message
      mapSvg.append("text")
        .attr("x", mapWidth / 2)
        .attr("y", mapHeight / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#ef4444")
        .text("Error loading world map data");
    }

  }, [worldData, data, viewMode, showWorldMap, continentFilter]);

  const continents = Array.from(new Set(data.map(d => d.Continent || d.WHORegion))).filter(Boolean);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-4 flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visualization Mode:
          </label>
          <select 
            value={viewMode} 
            onChange={e => setViewMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="casesPerMillion">Cases per Million vs Population</option>
            <option value="infectionRate">Infection Rate vs Mortality Rate</option>
            <option value="bubble">Bubble Chart (Cases vs Deaths per Million)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Continent:
          </label>
          <select 
            value={continentFilter} 
            onChange={e => setContinentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Continents</option>
            {continents.map(cont => (
              <option key={cont} value={cont}>{cont}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            View Type:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="viewType"
                checked={!showWorldMap}
                onChange={() => setShowWorldMap(false)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm text-gray-700">Scatter Plot</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="viewType"
                checked={showWorldMap}
                onChange={() => setShowWorldMap(true)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm text-gray-700">World Map</span>
            </label>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        {showWorldMap ? (
          <svg ref={mapRef}></svg>
        ) : (
          <svg ref={svgRef}></svg>
        )}
      </div>
      
      {/* Insights */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Analysis Insights:</h4>
        <div className="text-sm text-blue-800 space-y-1">
          {showWorldMap ? (
            <>
              <p>• 🗺️ World map view shows geographical distribution of COVID-19 impact across countries.</p>
              <p>• Darker colors indicate higher values - hover over countries for detailed information.</p>
              <p>• Gray areas represent countries with no data available.</p>
            </>
          ) : (
            <>
              {viewMode === "casesPerMillion" && (
                <p>• This view normalizes cases by population, revealing which countries were most affected relative to their size.</p>
              )}
              {viewMode === "infectionRate" && (
                <p>• This view shows the relationship between how widespread the infection was and how deadly it proved to be.</p>
              )}
              {viewMode === "bubble" && (
                <p>• Bubble size represents population. Look for large bubbles in high positions (high impact on big countries).</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopulationVsCasesScatter;
