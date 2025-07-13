import React, { useEffect, useState } from "react";

// Import chart components
import MeetingsProductivityChart from "./components/MeetingsProductivityChart";
import TestsVsCasesScatter from "./components/TestVsScatter";
import CasesVsPopulationScatter from "./components/CasePopulationScatter";
import MortalityRecoveryScatter from "./components/Scatter";
import IndiaCovidMap from "./components/data3/page1/india";
import Page from "./components/data2/page1/Page";
import Professinals from "./components/data/page1/professinals";

// Data parsing utilities
import { loadAndCleanCSV } from "./utils/dataParser";
import loadAndCleanCSV2 from "./utils/data2Parser";
import loadAndCleanIndiaCovid from "./utils/data3Parser";

function App() {
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Toggle dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [parsedData, parsedData2, parsedData3] = await Promise.all([
          loadAndCleanCSV("/data/cleaned_data.csv"),
          loadAndCleanCSV2("/data/worldometer_data.csv"),
          loadAndCleanIndiaCovid("/data/state_data.csv"),
        ]);
        setData(parsedData);
        setData2(parsedData2);
        setData3(parsedData3);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs = [
    { 
      id: "overview", 
      label: "Global Overview", 
      icon: "🌍", 
      description: "Comprehensive worldwide COVID-19 statistics and analysis" 
    },
    { 
      id: "professional", 
      label: "Professional Impact", 
      icon: "💼", 
      description: "Effects on working professionals and workplace dynamics" 
    },
    { 
      id: "india", 
      label: "India Analysis", 
      icon: "🇮🇳", 
      description: "State-wise data and geographical insights for India" 
    },
    { 
      id: "testing", 
      label: "Testing Analysis", 
      icon: "🧪", 
      description: "Testing effectiveness and correlation analysis" 
    },
    { 
      id: "population", 
      label: "Population Impact", 
      icon: "👥", 
      description: "Population-based impact and density correlations" 
    },
    { 
      id: "mortality", 
      label: "Recovery Trends", 
      icon: "📈", 
      description: "Mortality, recovery and outcome analysis" 
    },
    { 
      id: "productivity", 
      label: "Productivity Metrics", 
      icon: "📊", 
      description: "Meeting patterns and productivity analysis" 
    },
  ];

  // Calculate some basic stats for the header
  const getGlobalStats = () => {
    if (!data2 || data2.length === 0) return [];
    
    const totalCases = data2.reduce((sum, item) => sum + (parseInt(item.TotalCases?.replace(/,/g, '') || 0)), 0);
    const totalDeaths = data2.reduce((sum, item) => sum + (parseInt(item.TotalDeaths?.replace(/,/g, '') || 0)), 0);
    const totalRecovered = data2.reduce((sum, item) => sum + (parseInt(item.TotalRecovered?.replace(/,/g, '') || 0)), 0);
    
    return [
      { label: "Global Cases", value: totalCases.toLocaleString(), change: "+2.3%" },
      { label: "Total Deaths", value: totalDeaths.toLocaleString(), change: "+1.1%" },
      { label: "Recovered", value: totalRecovered.toLocaleString(), change: "+3.7%" },
      { label: "Countries", value: data2.length, change: "195" },
    ];
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case "overview":
        return <Page data={data2} />;
      case "professional":
        return <Professinals data={data} />;
      case "india":
        return <IndiaCovidMap data={data3} />;
      case "testing":
        return <TestsVsCasesScatter data={data2} />;
      case "population":
        return <CasesVsPopulationScatter data={data2} />;
      case "mortality":
        return <MortalityRecoveryScatter data={data2} />;
      case "productivity":
        return <MeetingsProductivityChart data={data} />;
      default:
        return <Page data={data2} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 dark:border-r-blue-500 rounded-full animate-spin" style={{animationDelay: '150ms'}}></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Loading comprehensive COVID-19 analytics data...
          </p>
        </div>
      </div>
    );
  }

  const globalStats = getGlobalStats();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      
      {/* Professional Header */}
      <header className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-900 dark:to-purple-900 text-white overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full blur-xl" />
          <div className="absolute top-1/2 -left-8 w-32 h-32 bg-white rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-1/3 w-16 h-16 bg-white rounded-full blur-lg" />
        </div>

        <div className="relative px-6 py-8 lg:px-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">🦠</span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                    COVID-19 Analytics Platform
                  </h1>
                </div>
                
                <p className="text-lg text-blue-100 leading-relaxed max-w-3xl">
                  Advanced data visualization and insights for pandemic impact analysis
                </p>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center gap-2"
                  >
                    <span>{darkMode ? "☀️" : "🌙"}</span>
                    {darkMode ? "Light" : "Dark"}
                  </button>
                  <button className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center gap-2">
                    <span>📱</span>
                    Export Data
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            {globalStats.length > 0 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {globalStats.map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20"
                  >
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-blue-100">
                      {stat.label}
                    </div>
                    <div className="text-xs mt-1 text-green-300">
                      {stat.change}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Navigation */}
        <nav className="sticky top-4 z-40">
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group relative px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                    border-2 backdrop-blur-sm hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                        : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:shadow-md"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className={`
                    absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                    px-3 py-2 bg-slate-900 text-white text-xs rounded-lg
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    pointer-events-none whitespace-nowrap z-50
                  `}>
                    {tab.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.icon} {tab.label}
                </option>
              ))}
            </select>
          </div>
        </nav>

        {/* Content Cards */}
        <div className="space-y-6">
          
          {/* Current Tab Info */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tabs.find(t => t.id === activeTab)?.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {tabs.find(t => t.id === activeTab)?.label}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {tabs.find(t => t.id === activeTab)?.description}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                  <div>Last updated</div>
                  <div className="font-semibold">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="animate-fade-in">
                {renderTabContent()}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-slate-500 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
            <span>COVID-19 Analytics Platform</span>
            <span className="hidden sm:inline">•</span>
            <span>Built with React & Modern Web Technologies</span>
            <span className="hidden sm:inline">•</span>
            <span>Data visualization powered by D3.js & Recharts</span>
          </div>
        </footer>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default App;
