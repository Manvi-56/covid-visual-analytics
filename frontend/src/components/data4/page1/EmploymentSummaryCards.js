import React from 'react';

const EmploymentSummaryCards = ({ stats, totalCountries }) => {
  if (!stats) return null;

  // Safely access properties with fallbacks
  const safeValue = (value, decimals = 1) => {
    return value !== undefined && value !== null ? Number(value).toFixed(decimals) : '0.0';
  };

  const cards = [
    {
      title: 'Countries Analyzed',
      value: stats.totalCountries || totalCountries || 0,
      label: 'Total Countries',
      icon: '🌍'
    },
    {
      title: 'Average Impact',
      value: `${safeValue(stats.avgImpactPercentage, 1)}%`,
      label: 'Hours Lost',
      icon: '⏰'
    },
    {
      title: 'High Impact Countries',
      value: stats.highImpactCountries || 0,
      label: '≥15% Hours Lost',
      icon: '🔴'
    },
    {
      title: 'Total Hours Lost',
      value: `${stats.totalHoursLost || 0}M`,
      label: 'Million Hours',
      icon: '�'
    },
    {
      title: 'Total Employment',
      value: `${stats.totalEmployment || 0}M`,
      label: 'Million People',
      icon: '�'
    },
    {
      title: 'Gender Ratio',
      value: safeValue(stats.avgGenderRatio, 2),
      label: 'Male/Female',
      icon: '⚖️'
    },
    {
      title: 'Labor Dependency',
      value: safeValue(stats.avgLaborDependency, 2),
      label: 'Dependency Ratio',
      icon: '�'
    },
    {
      title: 'Most Impacted',
      value: stats.mostImpactedCountry || 'N/A',
      label: 'Country',
      icon: '🎯'
    }
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, index) => (
        <div key={index} className="summary-card">
          <div className="card-icon">{card.icon}</div>
          <h3>{card.title}</h3>
          <div className="value">{card.value}</div>
          <div className="label">{card.label}</div>
        </div>
      ))}
    </div>
  );
};

export default EmploymentSummaryCards;
