import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StressPieChart from "./StressPieChart";
import SectorBarChart from "./SectorBarChart";
import HoursStressHeatmap from "./CorrelationHeatmap";
import SectorHoursBarChart from "./BoxPlotFixed";
import Card from "../../ui/Card";
import StatCard from "../../ui/StatCard";
import "./pro.css";

function Professinals({ data }) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Handle window resize for responsive charts
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Debug logging
  console.log("Professional Impact - Data received:", data);
  console.log("Professional Impact - Data length:", data?.length);
  if (data && data.length > 0) {
    console.log("Professional Impact - Sample data item:", data[0]);
    console.log("Professional Impact - Available fields:", Object.keys(data[0]));
  }

  // Show loading state for empty data
  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center text-secondary-500 dark:text-secondary-400">
          <div className="text-4xl mb-4">💼</div>
          <p className="text-lg">Loading professional impact data...</p>
          <p className="text-sm mt-2">Initializing data connections...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center text-secondary-500 dark:text-secondary-400">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg">No professional impact data available</p>
          <p className="text-sm mt-2">Please check if the data file is properly loaded</p>
        </div>
      </div>
    );
  }

  // Calculate some metrics from the data
  const totalProfessionals = data.length;
  const avgStressLevel = data.length > 0 
    ? (data.reduce((sum, item) => {
        const stressValue = item.Stress_Level || item.StressLevel;
        let stressNum = 0;
        if (typeof stressValue === 'string') {
          stressNum = stressValue.toLowerCase() === 'low' ? 3 : 
                     stressValue.toLowerCase() === 'medium' ? 6 : 
                     stressValue.toLowerCase() === 'high' ? 9 : 
                     parseFloat(stressValue) || 0;
        } else {
          stressNum = parseFloat(stressValue) || 0;
        }
        return sum + stressNum;
      }, 0) / data.length).toFixed(1)
    : 0;
  const avgWorkingHours = data.length > 0 
    ? (data.reduce((sum, item) => sum + (parseFloat(item.Hours_Worked_Per_Day || item.WorkingHours) || 0), 0) / data.length).toFixed(1)
    : 0;
  
  // Count unique sectors
  const uniqueSectors = [...new Set(data.map(item => item.Sector).filter(Boolean))].length;

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
      className="space-y-8 max-w-full overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      key={windowSize.width} // Force re-render on window resize
    >
      {/* Professional Impact Metrics */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center gap-2">
          <span>👔</span>
          Professional Impact Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Professionals"
            value={totalProfessionals.toLocaleString()}
            icon="👥"
            color="primary"
            size="sm"
            subtitle="Survey respondents"
          />
          <StatCard
            title="Avg Stress Level"
            value={avgStressLevel > 0 ? `${avgStressLevel}/10` : "N/A"}
            icon="😰"
            color="warning"
            size="sm"
            subtitle="Self-reported stress"
          />
          <StatCard
            title="Avg Working Hours"
            value={avgWorkingHours > 0 ? `${avgWorkingHours}h` : "N/A"}
            icon="⏰"
            color="covid.active"
            size="sm"
            subtitle="Daily work hours"
          />
          <StatCard
            title="Sectors"
            value={uniqueSectors}
            icon="🏢"
            color="covid.cases"
            size="sm"
            subtitle="Industries analyzed"
          />
        </div>
        
        
      </motion.div>

      {/* Charts Grid - Top Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Stress Level Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <span>🎯</span>
                Stress Level Distribution
              </Card.Title>
              <Card.Description>
                Distribution of self-reported stress levels among working professionals during the pandemic
              </Card.Description>
            </Card.Header>
            <Card.Content className="flex items-center justify-center p-4 min-h-[400px]">
              <div className="w-full max-w-[350px] h-[300px] flex items-center justify-center">
                <StressPieChart data={data} />
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Sector Impact Analysis */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <span>🏭</span>
                Sector Impact Analysis
              </Card.Title>
              <Card.Description>
                Comparative analysis of pandemic impact across different industry sectors
              </Card.Description>
            </Card.Header>
            <Card.Content className="p-4 min-h-[400px]">
              <div className="w-full h-[350px] overflow-hidden">
                <SectorBarChart data={data} />
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid - Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Working Hours vs Stress Correlation */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <span>🔥</span>
                Hours-Stress Correlation Heatmap
              </Card.Title>
              <Card.Description>
                Correlation analysis between working hours and stress levels across different parameters
              </Card.Description>
            </Card.Header>
            <Card.Content className="p-4 min-h-[400px]">
              <div className="w-full h-[350px] overflow-hidden">
                <HoursStressHeatmap data={data} />
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Sector Working Hours Analysis */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <span>📊</span>
                Sector Working Hours Distribution
              </Card.Title>
              <Card.Description>
                Box plot analysis showing working hours distribution and outliers by sector
              </Card.Description>
            </Card.Header>
            <Card.Content className="p-4 min-h-[400px]">
              <div className="w-full h-[350px] overflow-hidden">
                <SectorHoursBarChart data={data} />
              </div>
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
              Professional Impact Insights
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/50 dark:bg-secondary-800/50 rounded-xl border border-primary-200 dark:border-primary-700">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Increased Workload</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Many professionals report longer working hours and increased job responsibilities during the pandemic.
                </p>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-secondary-800/50 rounded-xl border border-primary-200 dark:border-primary-700">
                <div className="text-2xl mb-2">😟</div>
                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Elevated Stress</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Stress levels have significantly increased across all sectors, with healthcare and education most affected.
                </p>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-secondary-800/50 rounded-xl border border-primary-200 dark:border-primary-700">
                <div className="text-2xl mb-2">⚖️</div>
                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Work-Life Balance</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Remote work has blurred boundaries between personal and professional life, affecting mental health.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default Professinals;
