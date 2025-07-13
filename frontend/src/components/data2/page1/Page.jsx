import React from "react";
import { motion } from "framer-motion";
import TestsPerMillionLineChart from "./TestLineChart";
import DeathsPieChart from "./PieChart";
import GroupedBarChart from "./RegionWiseBarChart";
import Card from "../../ui/Card";
import StatCard from "../../ui/StatCard";
import InteractiveChart from "../../ui/InteractiveChart";
import "./page.css";

function Page({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center text-secondary-500 dark:text-secondary-400">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-lg">Loading global COVID-19 data...</p>
                </div>
            </div>
        );
    }

    // Safe number parsing function
    const parseValue = (value) => {
      if (typeof value === 'string') {
        return parseInt(value.replace(/,/g, '') || 0);
      }
      return parseInt(value || 0);
    };

    // Calculate key metrics
    const totalCases = data.reduce((sum, item) => sum + parseValue(item.TotalCases), 0);
    const totalDeaths = data.reduce((sum, item) => sum + parseValue(item.TotalDeaths), 0);
    const totalRecovered = data.reduce((sum, item) => sum + parseValue(item.TotalRecovered), 0);
    const activeCases = totalCases - totalDeaths - totalRecovered;
    const mortalityRate = totalCases > 0 ? ((totalDeaths / totalCases) * 100).toFixed(2) : 0;
    const recoveryRate = totalCases > 0 ? ((totalRecovered / totalCases) * 100).toFixed(2) : 0;

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
            {/* Key Metrics Grid */}
            <motion.div variants={itemVariants}>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center gap-2">
                    <span>📈</span>
                    Global Impact Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard
                        title="Total Cases"
                        value={totalCases.toLocaleString()}
                        icon="📊"
                        color="covid.cases"
                        size="sm"
                        subtitle="Confirmed infections"
                    />
                    <StatCard
                        title="Deaths"
                        value={totalDeaths.toLocaleString()}
                        icon="💔"
                        color="covid.deaths"
                        size="sm"
                        subtitle={`${mortalityRate}% mortality rate`}
                    />
                    <StatCard
                        title="Recovered"
                        value={totalRecovered.toLocaleString()}
                        icon="💚"
                        color="covid.recovered"
                        size="sm"
                        subtitle={`${recoveryRate}% recovery rate`}
                    />
                    <StatCard
                        title="Active Cases"
                        value={activeCases.toLocaleString()}
                        icon="🔄"
                        color="covid.active"
                        size="sm"
                        subtitle="Currently infected"
                    />
                    <StatCard
                        title="Countries"
                        value={data.length}
                        icon="🌍"
                        color="primary"
                        size="sm"
                        subtitle="Affected regions"
                    />
                    <StatCard
                        title="Data Points"
                        value={`${(data.length * 10).toLocaleString()}+`}
                        icon="📋"
                        color="primary"
                        size="sm"
                        subtitle="Analytics sources"
                    />
                </div>
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Deaths Distribution */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <Card.Header>
                            <Card.Title className="flex items-center gap-2">
                                <span>💀</span>
                                Death Distribution by Continent
                            </Card.Title>
                            <Card.Description>
                                Proportional analysis of COVID-19 fatalities across different regions
                            </Card.Description>
                        </Card.Header>
                        <Card.Content className="p-4">
                            <InteractiveChart 
                                title="Death Distribution by Continent"
                                modalTitle="COVID-19 Death Distribution Analysis - Detailed View"
                                className="h-[400px]"
                            >
                                <DeathsPieChart data={data} />
                            </InteractiveChart>
                        </Card.Content>
                    </Card>
                </motion.div>

                {/* Regional Comparison */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <Card.Header>
                            <Card.Title className="flex items-center gap-2">
                                <span>📊</span>
                                Regional Impact Comparison
                            </Card.Title>
                            <Card.Description>
                                Comparative analysis of cases, deaths, and recoveries by continent
                            </Card.Description>
                        </Card.Header>
                        <Card.Content className="p-4">
                            <InteractiveChart 
                                title="Regional Impact Comparison"
                                modalTitle="COVID-19 Regional Impact Analysis - Detailed View"
                                className="h-[400px]"
                            >
                                <GroupedBarChart data={data} />
                            </InteractiveChart>
                        </Card.Content>
                    </Card>
                </motion.div>
            </div>

            {/* Testing Trends */}
            <motion.div variants={itemVariants}>
                <Card>
                    <Card.Header>
                        <Card.Title className="flex items-center gap-2">
                            <span>🧪</span>
                            Global Testing Trends
                        </Card.Title>
                        <Card.Description>
                            Tests per million population over time - tracking testing capacity and coverage
                        </Card.Description>
                    </Card.Header>
                    <Card.Content className="p-4">
                        <InteractiveChart 
                            title="Global Testing Trends"
                            modalTitle="COVID-19 Global Testing Analysis - Detailed View"
                            className="h-[400px]"
                        >
                            <TestsPerMillionLineChart data={data} />
                        </InteractiveChart>
                    </Card.Content>
                </Card>
            </motion.div>

            {/* Key Insights */}
            <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-800 border-primary-200 dark:border-primary-800">
                    <Card.Header>
                        <Card.Title className="flex items-center gap-2 text-primary-800 dark:text-primary-200">
                            <span>💡</span>
                            Key Insights
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-white/50 dark:bg-secondary-800/50 rounded-xl border border-primary-200 dark:border-primary-700">
                                <div className="text-2xl mb-2">🔬</div>
                                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Testing Coverage</h4>
                                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                    Enhanced testing capabilities have improved early detection and contact tracing effectiveness.
                                </p>
                            </div>
                            <div className="text-center p-4 bg-white/50 dark:bg-secondary-800/50 rounded-xl border border-primary-200 dark:border-primary-700">
                                <div className="text-2xl mb-2">📈</div>
                                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Regional Trends</h4>
                                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                    Different continents show varying impact patterns based on healthcare infrastructure and policies.
                                </p>
                            </div>
                            <div className="text-center p-4 bg-white/50 dark:bg-secondary-800/50 rounded-xl border border-primary-200 dark:border-primary-700">
                                <div className="text-2xl mb-2">🌍</div>
                                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Global Impact</h4>
                                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                    The pandemic's impact varies significantly across regions, influenced by multiple socioeconomic factors.
                                </p>
                            </div>
                        </div>
                    </Card.Content>
                </Card>
            </motion.div>
        </motion.div>
    );
}

export default Page;