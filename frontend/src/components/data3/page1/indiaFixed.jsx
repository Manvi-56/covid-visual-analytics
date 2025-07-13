import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import "./india.css";

function India({ data }) {
  const [selectedState, setSelectedState] = useState(null);
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    // Load GeoJSON data for Indian states
    d3.json("/data/india_state.geojson")
      .then((data) => {
        setGeoData(data);
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
      });
  }, []);

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

  // Calculate metrics from the data
  const totalCases = data.reduce((sum, state) => sum + (parseInt(state.Total_Cases) || 0), 0);
  const totalDeaths = data.reduce((sum, state) => sum + (parseInt(state.Deaths) || 0), 0);
  const totalRecovered = data.reduce((sum, state) => sum + (parseInt(state.Cured) || 0), 0);
  const activeCases = totalCases - totalDeaths - totalRecovered;

  const mortalityRate = totalCases > 0 ? ((totalDeaths / totalCases) * 100).toFixed(2) : 0;
  const recoveryRate = totalCases > 0 ? ((totalRecovered / totalCases) * 100).toFixed(2) : 0;

  // Get top 5 states by cases
  const topStates = [...data]
    .sort((a, b) => (parseInt(b.Total_Cases) || 0) - (parseInt(a.Total_Cases) || 0))
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
                <div className="text-xl font-bold text-red-600">{activeCases.toLocaleString()}</div>
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
          </div>
          <div className="p-6">
            <div className="aspect-square max-w-md mx-auto bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <div className="text-4xl mb-4">🗺️</div>
                <p className="text-sm">Interactive India Map</p>
                <p className="text-xs text-slate-400 mt-1">D3.js map visualization loading...</p>
              </div>
            </div>
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
                  key={state.State_UT || index} 
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedState(state)}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-bold text-orange-600 dark:text-orange-400">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {state.State_UT || 'Unknown State'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {parseInt(state.Total_Cases || 0).toLocaleString()} cases
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {((parseInt(state.Total_Cases || 0) / totalCases) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected State Details */}
      {selectedState && (
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-800 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-200 dark:border-blue-700 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <span>📍</span>
              {selectedState.State_UT} - Detailed Statistics
            </h4>
            <button 
              onClick={() => setSelectedState(null)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="text-2xl mb-2">😷</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Cases</div>
                <div className="text-lg font-bold text-orange-600">
                  {parseInt(selectedState.Total_Cases || 0).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Recovered</div>
                <div className="text-lg font-bold text-green-600">
                  {parseInt(selectedState.Cured || 0).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="text-2xl mb-2">💔</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Deaths</div>
                <div className="text-lg font-bold text-gray-600">
                  {parseInt(selectedState.Deaths || 0).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="text-2xl mb-2">🚨</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Active</div>
                <div className="text-lg font-bold text-red-600">
                  {(parseInt(selectedState.Total_Cases || 0) - parseInt(selectedState.Cured || 0) - parseInt(selectedState.Deaths || 0)).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default India;
