import React from "react";
import StressPieChart from "./StressPieChart";
import SectorBarChart from "./SectorBarChart";
import HoursStressHeatmap from "./CorrelationHeatmap";
import SectorHoursBarChart from "./BoxPlot";
import "./pro.css";

function Professinals({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <div className="text-4xl mb-4">💼</div>
          <p className="text-lg">Loading professional impact data...</p>
        </div>
      </div>
    );
  }

  // Calculate some metrics from the data
  const totalProfessionals = data.length;
  const avgStressLevel = data.length > 0 
    ? (data.reduce((sum, item) => sum + (parseFloat(item.StressLevel) || 0), 0) / data.length).toFixed(1)
    : 0;
  const avgWorkingHours = data.length > 0 
    ? (data.reduce((sum, item) => sum + (parseFloat(item.WorkingHours) || 0), 0) / data.length).toFixed(1)
    : 0;
  
  // Count unique sectors
  const uniqueSectors = [...new Set(data.map(item => item.Sector).filter(Boolean))].length;

  return (
    <div className="space-y-8">
      {/* Professional Impact Metrics */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <span>👔</span>
          Professional Impact Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👥</span>
              <div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Professionals</div>
                <div className="text-xl font-bold text-blue-600">{totalProfessionals.toLocaleString()}</div>
                <div className="text-xs text-slate-500">Survey respondents</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">😰</span>
              <div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Stress Level</div>
                <div className="text-xl font-bold text-amber-600">{avgStressLevel}/10</div>
                <div className="text-xs text-slate-500">Self-reported stress</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏰</span>
              <div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Working Hours</div>
                <div className="text-xl font-bold text-blue-600">{avgWorkingHours}h</div>
                <div className="text-xs text-slate-500">Daily work hours</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏢</span>
              <div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Sectors</div>
                <div className="text-xl font-bold text-green-600">{uniqueSectors}</div>
                <div className="text-xs text-slate-500">Industries analyzed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid - Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stress Level Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🎯</span>
              Stress Level Distribution
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Distribution of self-reported stress levels among working professionals during the pandemic
            </p>
          </div>
          <div className="p-6 flex items-center justify-center">
            <StressPieChart data={data} />
          </div>
        </div>

        {/* Sector Impact Analysis */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🏭</span>
              Sector Impact Analysis
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Comparative analysis of pandemic impact across different industry sectors
            </p>
          </div>
          <div className="p-6 flex items-center justify-center">
            <SectorBarChart data={data} />
          </div>
        </div>
      </div>

      {/* Charts Grid - Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Working Hours vs Stress Correlation */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🔥</span>
              Hours-Stress Correlation Heatmap
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Correlation analysis between working hours and stress levels across different parameters
            </p>
          </div>
          <div className="p-6 flex items-center justify-center">
            <HoursStressHeatmap data={data} />
          </div>
        </div>

        {/* Sector Working Hours Analysis */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📊</span>
              Sector Working Hours Distribution
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Box plot analysis showing working hours distribution and outliers by sector
            </p>
          </div>
          <div className="p-6 flex items-center justify-center">
            <SectorHoursBarChart data={data} />
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-800 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
        <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-200 dark:border-blue-700">
          <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <span>💡</span>
            Professional Impact Insights
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="text-2xl mb-2">📈</div>
              <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Increased Workload</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Many professionals report longer working hours and increased job responsibilities during the pandemic.
              </p>
            </div>
            <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="text-2xl mb-2">😟</div>
              <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Elevated Stress</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Stress levels have significantly increased across all sectors, with healthcare and education most affected.
              </p>
            </div>
            <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="text-2xl mb-2">⚖️</div>
              <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Work-Life Balance</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Remote work has blurred boundaries between personal and professional life, affecting mental health.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Professinals;
