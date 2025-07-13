// src/App.js
import React, { useEffect, useState } from "react";
// Import your individual chart components. We'll style these internally later.

import MeetingsProductivityChart from "./components/MeetingsProductivityChart";
import TestsVsCasesScatter from "./components/TestVsScatter";
import CasesVsPopulationScatter from "./components/CasePopulationScatter";
import MortalityRecoveryScatter from "./components/Scatter";
import IndiaCovidMap from "./components/data3/page1/india";
import Page from "./components/data2/page1/Page";
import Professinals from "./components/data/page1/professinals"; // Typo Alert: Remember to rename this file to 'professionals.jsx' and update import path

// Data parsing utilities
import { loadAndCleanCSV } from "./utils/dataParser";
import loadAndCleanCSV2 from "./utils/data2Parser";
import loadAndCleanIndiaCovid from "./utils/data3Parser"; // Corrected path for data3Parser

function App() {
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [tab, setTab] = useState("page1");
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tabs = [
    { id: "page1", label: "Global Overview", icon: "🌍", description: "Worldwide COVID-19 statistics and trends" },
    { id: "working", label: "Professional Impact", icon: "💼", description: "Effects on working professionals" },
    { id: "india", label: "India Analysis", icon: "🇮🇳", description: "State-wise data and insights" },
    { id: "scatter", label: "Tests vs Cases", icon: "🧪", description: "Testing effectiveness analysis" },
    { id: "sc", label: "Cases vs Population", icon: "👥", description: "Population impact correlation" },
    { id: "sc2", label: "Mortality vs Recovery", icon: "📈", description: "Recovery and mortality trends" },
    { id: "meetings", label: "Productivity Analysis", icon: "📊", description: "Meeting and productivity metrics" },
  ];

  const LoadingSpinner = () => (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animation-delay-150"></div>
        </div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 animate-pulse">
          Loading comprehensive data analysis...
        </p>
        <div className="mt-2 w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        </div>
      </div>
  );

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 text-slate-800 dark:text-slate-100 font-sans">

        {/* Hero Section - Enhanced with parallax effect */}
        <section className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
          {/* Animated background with parallax */}
          <div
              className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950"
              style={{
                transform: `translateY(${scrollY * 0.5}px)`,
              }}
          >
            {/* Floating geometric shapes */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 opacity-20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500 opacity-30 rounded-full blur-lg animate-bounce"></div>
            <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-indigo-500 opacity-15 rounded-full blur-2xl animate-pulse animation-delay-300"></div>
            <div className="absolute bottom-20 right-20 w-28 h-28 bg-cyan-500 opacity-25 rounded-full blur-xl animate-bounce animation-delay-700"></div>
          </div>

          {/* Grid overlay for tech aesthetic */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent bg-repeat"
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