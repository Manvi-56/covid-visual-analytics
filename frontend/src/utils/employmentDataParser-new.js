import Papa from 'papaparse';

export const loadEmploymentData = async () => {
  try {
    const response = await fetch('/data/covid_impact_on_work new.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const processedData = processEmploymentData(results.data);
            resolve(processedData);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading employment data:', error);
    throw error;
  }
};

const processEmploymentData = (rawData) => {
  const processedData = rawData
    .filter(row => row.Country && row.Country.trim() !== '')
    .map(row => {
      // Clean and convert numeric values
      const parseNumber = (value) => {
        if (!value || value === '') return 0;
        // Handle numbers with dots as thousand separators
        const cleaned = value.toString().replace(/\./g, '').replace(/,/g, '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      };

      const hoursLost = parseNumber(row['Hours lost due to COVID-19 (millions)']);
      const totalHours = parseNumber(row['Total working hours (2019, millions)']);
      const maleEmployment = parseNumber(row['Male employment (thousands)']);
      const femaleEmployment = parseNumber(row['Female employment (thousands)']);
      const laborDependency = parseNumber(row['Labour dependency ratio']);

      // Calculate derived metrics
      const impactPercentage = totalHours > 0 ? (hoursLost / totalHours) * 100 : 0;
      const totalEmployment = maleEmployment + femaleEmployment;
      const genderRatio = femaleEmployment > 0 ? maleEmployment / femaleEmployment : 0;

      // Classify impact level
      let impactLevel = 'Low';
      if (impactPercentage > 15) impactLevel = 'High';
      else if (impactPercentage > 8) impactLevel = 'Medium';

      // Regional classification (simplified)
      const region = getRegion(row.Country);

      return {
        country: row.Country,
        hoursLost,
        totalHours,
        maleEmployment,
        femaleEmployment,
        laborDependency,
        impactPercentage,
        totalEmployment,
        genderRatio,
        impactLevel,
        region,
        rawData: row
      };
    })
    .filter(item => item.totalEmployment > 0); // Filter out invalid data

  return processedData;
};

const getRegion = (country) => {
  const regions = {
    'Americas': [
      'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia', 
      'Peru', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Guyana', 
      'Suriname', 'French Guiana', 'Costa Rica', 'Panama', 'Nicaragua', 'Honduras',
      'Guatemala', 'Belize', 'El Salvador', 'Jamaica', 'Cuba', 'Haiti', 'Dominican Republic'
    ],
    'Europe': [
      'Germany', 'France', 'United Kingdom', 'Italy', 'Spain', 'Poland', 'Romania',
      'Netherlands', 'Belgium', 'Czech Republic', 'Greece', 'Portugal', 'Sweden',
      'Hungary', 'Austria', 'Belarus', 'Switzerland', 'Bulgaria', 'Serbia', 'Denmark',
      'Finland', 'Slovakia', 'Norway', 'Ireland', 'Croatia', 'Bosnia and Herzegovina',
      'Albania', 'Lithuania', 'Slovenia', 'Latvia', 'Estonia', 'Macedonia', 'Moldova',
      'Luxembourg', 'Malta', 'Iceland', 'Montenegro', 'Andorra', 'Liechtenstein',
      'San Marino', 'Monaco', 'Vatican City', 'Russia', 'Ukraine'
    ],
    'Asia': [
      'China', 'India', 'Indonesia', 'Pakistan', 'Bangladesh', 'Japan', 'Philippines',
      'Vietnam', 'Turkey', 'Iran', 'Thailand', 'Myanmar', 'South Korea', 'Iraq',
      'Afghanistan', 'Saudi Arabia', 'Uzbekistan', 'Malaysia', 'Nepal', 'Yemen',
      'North Korea', 'Sri Lanka', 'Kazakhstan', 'Syria', 'Cambodia', 'Jordan',
      'Azerbaijan', 'United Arab Emirates', 'Tajikistan', 'Israel', 'Laos',
      'Singapore', 'Oman', 'Kuwait', 'Georgia', 'Mongolia', 'Armenia', 'Qatar',
      'Bahrain', 'East Timor', 'Maldives', 'Brunei', 'Bhutan'
    ],
    'Africa': [
      'Nigeria', 'Ethiopia', 'Egypt', 'Democratic Republic of the Congo', 'Tanzania',
      'South Africa', 'Kenya', 'Uganda', 'Algeria', 'Sudan', 'Morocco', 'Angola',
      'Ghana', 'Mozambique', 'Madagascar', 'Cameroon', 'Ivory Coast', 'Niger',
      'Burkina Faso', 'Mali', 'Malawi', 'Zambia', 'Senegal', 'Somalia', 'Chad',
      'Zimbabwe', 'Guinea', 'Rwanda', 'Benin', 'Burundi', 'Tunisia', 'Togo',
      'Sierra Leone', 'Libya', 'Liberia', 'Central African Republic', 'Mauritania',
      'Eritrea', 'Gambia', 'Botswana', 'Namibia', 'Gabon', 'Lesotho', 'Guinea-Bissau',
      'Equatorial Guinea', 'Mauritius', 'Eswatini', 'Djibouti', 'Comoros', 
      'Cape Verde', 'Sao Tome and Principe', 'Seychelles'
    ],
    'Oceania': [
      'Australia', 'Papua New Guinea', 'New Zealand', 'Fiji', 'Solomon Islands',
      'Vanuatu', 'Samoa', 'Micronesia', 'Tonga', 'Kiribati', 'Palau', 'Marshall Islands',
      'Tuvalu', 'Nauru'
    ]
  };

  for (const [regionName, countries] of Object.entries(regions)) {
    if (countries.some(c => country.toLowerCase().includes(c.toLowerCase()) || 
                           c.toLowerCase().includes(country.toLowerCase()))) {
      return regionName;
    }
  }
  return 'Other';
};

export const getEmploymentSummaryStats = (data) => {
  if (!data || data.length === 0) return {};

  const totalCountries = data.length;
  const totalHoursLost = data.reduce((sum, item) => sum + item.hoursLost, 0);
  const avgImpactPercentage = data.reduce((sum, item) => sum + item.impactPercentage, 0) / totalCountries;
  const totalEmployment = data.reduce((sum, item) => sum + item.totalEmployment, 0);
  
  const highImpactCountries = data.filter(item => item.impactLevel === 'High').length;
  const avgLaborDependency = data.reduce((sum, item) => sum + item.laborDependency, 0) / totalCountries;
  
  const avgGenderRatio = data.reduce((sum, item) => sum + item.genderRatio, 0) / totalCountries;
  const mostImpactedCountry = data.reduce((max, item) => 
    item.impactPercentage > max.impactPercentage ? item : max, data[0]);

  return {
    totalCountries,
    totalHoursLost: Math.round(totalHoursLost),
    avgImpactPercentage: Math.round(avgImpactPercentage * 10) / 10,
    totalEmployment: Math.round(totalEmployment / 1000), // Convert to millions
    highImpactCountries,
    avgLaborDependency: Math.round(avgLaborDependency * 10) / 10,
    avgGenderRatio: Math.round(avgGenderRatio * 100) / 100,
    mostImpactedCountry: mostImpactedCountry.country
  };
};

export const getRegionalData = (data) => {
  const regionalStats = {};
  
  data.forEach(item => {
    if (!regionalStats[item.region]) {
      regionalStats[item.region] = {
        countries: [],
        totalHoursLost: 0,
        totalEmployment: 0,
        avgImpactPercentage: 0,
        avgLaborDependency: 0
      };
    }
    
    regionalStats[item.region].countries.push(item);
    regionalStats[item.region].totalHoursLost += item.hoursLost;
    regionalStats[item.region].totalEmployment += item.totalEmployment;
  });

  // Calculate averages
  Object.keys(regionalStats).forEach(region => {
    const countries = regionalStats[region].countries;
    regionalStats[region].avgImpactPercentage = 
      countries.reduce((sum, c) => sum + c.impactPercentage, 0) / countries.length;
    regionalStats[region].avgLaborDependency = 
      countries.reduce((sum, c) => sum + c.laborDependency, 0) / countries.length;
  });

  return regionalStats;
};
