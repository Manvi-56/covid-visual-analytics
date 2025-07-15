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
import EmploymentAnalysis from "./components/data4/page1/EmploymentAnalysis";

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
        console.log("App.js - Professional data loaded:", parsedData?.length, "items");
        console.log("App.js - Global data loaded:", parsedData2?.length, "items");
        console.log("App.js - India data loaded:", parsedData3?.length, "items");
        if (parsedData?.length > 0) {
          console.log("App.js - Sample professional data:", parsedData[0]);
        }
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
    { 
      id: "employment", 
      label: "Employment Impact", 
      icon: "🏢", 
      description: "Global employment impact and working hours analysis" 
    },
  ];

  // Calculate some basic stats for the header
  const getGlobalStats = () => {
    if (!data2 || data2.length === 0) return [];
    
    const parseValue = (value) => {
      if (typeof value === 'string') {
        return parseInt(value.replace(/,/g, '') || 0);
      }
      return parseInt(value || 0);
    };
    
    const totalCases = data2.reduce((sum, item) => sum + parseValue(item.TotalCases), 0);
    const totalDeaths = data2.reduce((sum, item) => sum + parseValue(item.TotalDeaths), 0);
    const totalRecovered = data2.reduce((sum, item) => sum + parseValue(item.TotalRecovered), 0);
    
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
          {activeTab === "employment" && <EmploymentAnalysis />}
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
                {/* <div className="text-right text-sm text-secondary-500 dark:text-secondary-400">
                  <div>Last updated</div>
                  <div className="font-semibold">{new Date().toLocaleDateString()}</div>
                </div> */}
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
