import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import chart components
import MeetingsProductivityChart from "./components/MeetingsProductivityChart";
import TestsVsCasesScatter from "./components/TestVsScatter";
import CasesVsPopulationScatter from "./components/CasePopulationScatter";
import MortalityRecoveryScatter from "./components/Scatter";
import IndiaCovidMap from "./components/data3/page1/india";
import Page from "./components/data2/page1/Page";
import Professinals from "./components/data/page1/professinals";

// Import UI components
import Card from "./components/ui/Card";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import Navigation from "./components/ui/Navigation";
import PageHeader from "./components/ui/PageHeader";
import StatCard from "./components/ui/StatCard";
import Button from "./components/ui/Button";

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
    const fadeVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {activeTab === "overview" && <Page data={data2} />}
          {activeTab === "professional" && <Professinals data={data} />}
          {activeTab === "india" && <IndiaCovidMap data={data3} />}
          {activeTab === "testing" && <TestsVsCasesScatter data={data2} />}
          {activeTab === "population" && <CasesVsPopulationScatter data={data2} />}
          {activeTab === "mortality" && <MortalityRecoveryScatter data={data2} />}
          {activeTab === "productivity" && <MeetingsProductivityChart data={data} />}
        </motion.div>
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-900 dark:to-secondary-800 flex items-center justify-center">
        <LoadingSpinner 
          size="xl" 
          text="Loading comprehensive COVID-19 analytics data..."
          className="text-center"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-primary-50 to-secondary-100 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-900 transition-colors duration-300">
      
      {/* Page Header */}
      <PageHeader
        title="COVID-19 Analytics Platform"
        subtitle="Advanced data visualization and insights for pandemic impact analysis"
        icon="🦠"
        stats={getGlobalStats()}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              icon={darkMode ? "☀️" : "🌙"}
            >
              {darkMode ? "Light" : "Dark"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="📱"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              Export Data
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Navigation */}
        <Navigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="sticky top-4 z-40"
        />

        {/* Content Cards */}
        <div className="space-y-6">
          
          {/* Current Tab Info */}
          <Card className="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm">
            <Card.Header>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tabs.find(t => t.id === activeTab)?.icon}</span>
                  <div>
                    <Card.Title>{tabs.find(t => t.id === activeTab)?.label}</Card.Title>
                    <Card.Description>{tabs.find(t => t.id === activeTab)?.description}</Card.Description>
                  </div>
                </div>
                <div className="text-right text-sm text-secondary-500 dark:text-secondary-400">
                  <div>Last updated</div>
                  <div className="font-semibold">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              {renderTabContent()}
            </Card.Content>
          </Card>

        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8 text-secondary-500 dark:text-secondary-400"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
            <span>COVID-19 Analytics Platform</span>
            <span className="hidden sm:inline">•</span>
            <span>Built with React & Modern Web Technologies</span>
            <span className="hidden sm:inline">•</span>
            <span>Data visualization powered by D3.js & Recharts</span>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
                 style={{
                   backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                   backgroundSize: '50px 50px'
                 }}>
            </div>
          </div>

          {/* Content Overlay with enhanced animations */}
          <div className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-2xl">
                Pandemic
              </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-100 via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Analytics
              </span>
              </h1>
            </div>

            <div className="animate-fade-in-up animation-delay-300">
              <p className="text-xl sm:text-2xl md:text-3xl opacity-90 mb-8 font-light leading-relaxed max-w-4xl mx-auto">
                Transforming complex <span className="font-semibold text-cyan-300">COVID-19 data</span> into
                actionable insights through cutting-edge visualization and analysis
              </p>
            </div>

            {/* Enhanced CTA with multiple buttons */}
            <div className="animate-fade-in-up animation-delay-600 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                  onClick={() => {
                    document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group relative bg-white text-blue-900 font-bold py-4 px-8 rounded-full text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
              >
              <span className="relative z-10 flex items-center gap-2">
                📊 View Analytics
              </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/*<button*/}
              {/*    onClick={() => setTab("page1")}*/}
              {/*    className="group bg-transparent border-2 border-white text-white font-semibold py-4 px-8 rounded-full text-lg hover:bg-white hover:text-blue-900 transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1"*/}
              {/*>*/}
              {/*<span className="flex items-center gap-2">*/}
              {/*  📊 View Analytics*/}
              {/*</span>*/}
              {/*</button>*/}
            </div>

            {/* Floating stats preview */}
            <div className="animate-fade-in-up animation-delay-900 mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { label: "Global Data", value: "200+" },
                { label: "Countries", value: "195" },
                { label: "Data Points", value: "1M+" },
                { label: "Visualizations", value: "7" }
              ].map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                    <div className="text-2xl font-bold text-cyan-300">{stat.value}</div>
                    <div className="text-sm opacity-80">{stat.label}</div>
                  </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Main Content Area - Enhanced design */}
        <div id="main-content" className="w-full max-w-7xl mx-auto p-4 md:p-8 mt-[-7rem] relative z-20">
          {/* Glass morphism container */}
          <div className="bg-white bg-opacity-80 dark:bg-slate-800 dark:bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white border-opacity-20 overflow-hidden">

            {/* Enhanced header section */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12 text-white">
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Interactive Data Dashboard
                </h2>
                <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                  Navigate through comprehensive COVID-19 analytics with our interactive visualization suite
                </p>
              </div>
            </div>

            {/* Enhanced Tabs Container */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`
                    group relative p-4 rounded-xl text-left transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1 border-2
                    ${
                            tab === t.id
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-300 shadow-xl shadow-blue-500/25"
                                : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-blue-300 hover:shadow-lg"
                        }
                  `}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{t.icon}</span>
                        <span className="font-semibold text-sm">{t.label}</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${tab === t.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {t.description}
                      </p>

                      {/* Active indicator */}
                      {tab === t.id && (
                          <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      )}
                    </button>
                ))}
              </div>
            </div>

            {/* Enhanced Chart Rendering Area */}
            <div className="p-6 md:p-8">
              {loading ? (
                  <LoadingSpinner />
              ) : (
                  <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Chart header */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-900 p-6 border-b border-slate-200 dark:border-slate-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                            <span className="text-3xl">{tabs.find(t => t.id === tab)?.icon}</span>
                            {tabs.find(t => t.id === tab)?.label}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-300 mt-1">
                            {tabs.find(t => t.id === tab)?.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Last updated</div>
                          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart content */}
                    <div className="p-6 md:p-8 animate-fade-in">
                      {tab === "working" && <Professinals data={data} />}
                      {tab === "meetings" && <MeetingsProductivityChart data={data} />}
                      {tab === "scatter" && <TestsVsCasesScatter data={data2} />}
                      {tab === "page1" && <Page data={data2} />}
                      {tab === "sc" && <CasesVsPopulationScatter data={data2} />}
                      {tab === "sc2" && <MortalityRecoveryScatter data={data2} />}
                      {tab === "india" && <IndiaCovidMap data={data3} />}
                    </div>
                  </div>
              )}
            </div>
          </div>

          {/* Footer section */}
          <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
            <p className="text-sm">
              Data visualization dashboard • Built with React & Modern Web Technologies
            </p>
          </div>
        </div>

        {/* Add required CSS for animations */}
        <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animation-delay-150 {
          animation-delay: 150ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animation-delay-700 {
          animation-delay: 700ms;
        }

        .animation-delay-900 {
          animation-delay: 900ms;
        }

        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
      </div>
  );
}

export default App;