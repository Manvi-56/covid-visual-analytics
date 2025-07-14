import React, { useState, useEffect } from 'react';
import { loadEmploymentData, getEmploymentSummaryStats, getRegionalData } from '../../../utils/employmentDataParser';
import EmploymentWorldMap from './EmploymentWorldMap';
import EmploymentSummaryCards from './EmploymentSummaryCards';
import RegionalEmploymentComparison from './RegionalEmploymentComparison';
import GenderEmploymentAnalysis from './GenderEmploymentAnalysis';
import EmploymentImpactDistribution from './EmploymentImpactDistribution';
import './employment.css';

const EmploymentAnalysis = () => {
  const [employmentData, setEmploymentData] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to load employment data...');
      
      const data = await loadEmploymentData();
      console.log('Employment data loaded successfully:', data.length, 'records');
      
      setEmploymentData(data);
      
      const stats = getEmploymentSummaryStats(data);
      console.log('Summary stats calculated:', stats);
      setSummaryStats(stats);
      
    } catch (err) {
      console.error('Detailed error loading employment data:', err);
      setError(`Failed to load employment data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  if (loading) {
    return (
      <div className="employment-analysis loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading employment impact data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employment-analysis error">
        <div className="error-container">
          <h3>⚠️ Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={loadData} className="retry-button">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employment-analysis">
      {/* Header Section */}
      <div className="employment-header">
        <h1>🏢 COVID-19 Employment Impact Analysis</h1>
        <p className="header-description">
          Comprehensive analysis of COVID-19's impact on global employment patterns, 
          working hours, and gender employment ratios across different regions.
        </p>
      </div>

      {/* Summary Cards */}
      {summaryStats && (
        <EmploymentSummaryCards 
          stats={summaryStats}
          totalCountries={employmentData.length}
        />
      )}

      {/* World Map Visualization */}
      <div className="chart-section">
        <div className="section-header">
          <h2>🗺️ Global Employment Impact Map</h2>
          <p>Interactive map showing percentage of working hours lost due to COVID-19</p>
        </div>
        <EmploymentWorldMap 
          data={employmentData}
          onCountrySelect={handleCountrySelect}
          selectedCountry={selectedCountry}
        />
      </div>

      {/* Employment Impact Distribution */}
      <div className="chart-section">
        <div className="section-header">
          <h2>📊 Employment Impact Distribution</h2>
          <p>Distribution of employment impact levels across countries</p>
        </div>
        <EmploymentImpactDistribution data={employmentData} />
      </div>

      {/* Regional Comparison */}
      <div className="chart-section">
        <div className="section-header">
          <h2>🌍 Regional Employment Comparison</h2>
          <p>Comparing employment impact across different world regions</p>
        </div>
        <RegionalEmploymentComparison data={employmentData} />
      </div>

      {/* Gender Employment Analysis */}
      <div className="chart-section">
        <div className="section-header">
          <h2>👥 Gender Employment Analysis</h2>
          <p>Analysis of gender disparities in employment during COVID-19</p>
        </div>
        <GenderEmploymentAnalysis data={employmentData} />
      </div>

      {/* Selected Country Details */}
      {selectedCountry && (
        <div className="chart-section">
          <div className="section-header">
            <h2>🏳️ Country Details: {selectedCountry.country}</h2>
            <button 
              onClick={() => setSelectedCountry(null)}
              className="close-details-btn"
            >
              ✕ Close
            </button>
          </div>
          <div className="country-details">
            <div className="country-stats-grid">
              <div className="stat-card">
                <h4>Hours Lost</h4>
                <span className="stat-value">
                  {selectedCountry.percentageHoursLost?.toFixed(1)}%
                </span>
              </div>
              <div className="stat-card">
                <h4>Impact Level</h4>
                <span className={`stat-value impact-${selectedCountry.impactLevel?.toLowerCase()}`}>
                  {selectedCountry.impactLevel}
                </span>
              </div>
              <div className="stat-card">
                <h4>Female Employment Ratio</h4>
                <span className="stat-value">
                  {selectedCountry.femaleEmploymentRatio?.toFixed(1)}%
                </span>
              </div>
              <div className="stat-card">
                <h4>Labour Dependency Ratio</h4>
                <span className="stat-value">
                  {selectedCountry.labourDependencyRatio?.toFixed(2)}
                </span>
              </div>
              <div className="stat-card">
                <h4>Total Employed (25+)</h4>
                <span className="stat-value">
                  {(selectedCountry.totalEmployed / 1000)?.toFixed(1)}M
                </span>
              </div>
              <div className="stat-card">
                <h4>Region</h4>
                <span className="stat-value">
                  {selectedCountry.region}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Info Footer */}
      <div className="data-info">
        <p>
          <strong>Data Source:</strong> Employment impact data from global employment statistics. 
          Analysis includes {employmentData.length} countries with employment impact metrics.
        </p>
        <p>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default EmploymentAnalysis;
