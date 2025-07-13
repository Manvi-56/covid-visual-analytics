import React from "react";
import TestsPerMillionLineChart from "./TestLineChart";
import DeathsPieChart from "./PieChart";
import GroupedBarChart from "./RegionWiseBarChart";
import "./page.css";

function Page({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center text-slate-500 dark:text-slate-400">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-lg">Loading global COVID-19 data...</p>
                </div>
            </div>
        );
    }

    // Calculate key metrics
    const totalCases = data.reduce((sum, item) => sum + (parseInt(item.TotalCases?.replace(/,/g, '') || 0)), 0);
    const totalDeaths = data.reduce((sum, item) => sum + (parseInt(item.TotalDeaths?.replace(/,/g, '') || 0)), 0);
    const totalRecovered = data.reduce((sum, item) => sum + (parseInt(item.TotalRecovered?.replace(/,/g, '') || 0)), 0);
    const activeCases = totalCases - totalDeaths - totalRecovered;
    const mortalityRate = totalCases > 0 ? ((totalDeaths / totalCases) * 100).toFixed(2) : 0;
    const recoveryRate = totalCases > 0 ? ((totalRecovered / totalCases) * 100).toFixed(2) : 0;

    return (
        <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <span>📈</span>
                    Global Impact Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">📊</span>
                            <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Cases</div>
                                <div className="text-xl font-bold text-amber-600">{totalCases.toLocaleString()}</div>
                                <div className="text-xs text-slate-500">Confirmed infections</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">💔</span>
                            <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Deaths</div>
                                <div className="text-xl font-bold text-red-600">{totalDeaths.toLocaleString()}</div>
                                <div className="text-xs text-slate-500">{mortalityRate}% mortality rate</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">💚</span>
                            <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Recovered</div>
                                <div className="text-xl font-bold text-green-600">{totalRecovered.toLocaleString()}</div>
                                <div className="text-xs text-slate-500">{recoveryRate}% recovery rate</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🔄</span>
                            <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Cases</div>
                                <div className="text-xl font-bold text-blue-600">{activeCases.toLocaleString()}</div>
                                <div className="text-xs text-slate-500">Currently infected</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🌍</span>
                            <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Countries</div>
                                <div className="text-xl font-bold text-blue-600">{data.length}</div>
                                <div className="text-xs text-slate-500">Affected regions</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">📋</span>
                            <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Data Points</div>
                                <div className="text-xl font-bold text-blue-600">{(data.length * 10).toLocaleString()}+</div>
                                <div className="text-xs text-slate-500">Analytics sources</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Deaths Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span>💀</span>
                            Death Distribution by Continent
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Proportional analysis of COVID-19 fatalities across different regions
                        </p>
                    </div>
                    <div className="p-6 flex items-center justify-center">
                        <DeathsPieChart data={data} />
                    </div>
                </div>

                {/* Regional Comparison */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span>📊</span>
                            Regional Impact Comparison
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Comparative analysis of cases, deaths, and recoveries by continent
                        </p>
                    </div>
                    <div className="p-6 flex items-center justify-center">
                        <GroupedBarChart data={data} />
                    </div>
                </div>
            </div>

            {/* Testing Trends */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>🧪</span>
                        Global Testing Trends
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Tests per million population over time - tracking testing capacity and coverage
                    </p>
                </div>
                <div className="p-6">
                    <TestsPerMillionLineChart data={data} />
                </div>
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-800 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
                <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-200 dark:border-blue-700">
                    <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                        <span>💡</span>
                        Key Insights
                    </h4>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-blue-200 dark:border-blue-700">
                            <div className="text-2xl mb-2">🔬</div>
                            <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Testing Coverage</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Enhanced testing capabilities have improved early detection and contact tracing effectiveness.
                            </p>
                        </div>
                        <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-blue-200 dark:border-blue-700">
                            <div className="text-2xl mb-2">📈</div>
                            <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Regional Trends</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Different continents show varying impact patterns based on healthcare infrastructure and policies.
                            </p>
                        </div>
                        <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-blue-200 dark:border-blue-700">
                            <div className="text-2xl mb-2">🌍</div>
                            <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Global Impact</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                The pandemic's impact varies significantly across regions, influenced by multiple socioeconomic factors.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
