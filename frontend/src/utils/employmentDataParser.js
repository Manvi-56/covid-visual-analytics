import Papa from 'papaparse';

export const loadEmploymentData = async () => {
  try {
    const response = await fetch('/data/employment_data.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            console.log('Raw CSV data:', results.data.slice(0, 3)); // Debug log
            const processedData = processEmploymentData(results.data);
            console.log('Processed data:', processedData.slice(0, 3)); // Debug log
            resolve(processedData);
          } catch (error) {
            console.error('Error processing data:', error);
            reject(error);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
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
    .filter(row => row.country && row.country.trim() !== '')
    .map(row => {
      // Clean and convert numeric values
      const parseNumber = (value) => {
        if (!value || value === '') return 0;
        // Handle different number formats
        const cleaned = value.toString()
          .replace(/\s/g, '') // Remove spaces
          .replace(/,/g, '.'); // Replace commas with dots for decimals
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Map columns from the actual CSV structure
      const totalHours = parseNumber(row['total_weekly_hours_worked(estimates_in_thousands)']);
      const hoursLostPercentage = parseNumber(row['percentage_of_working_hrs_lost']);
      const maleEmployment = parseNumber(row['employed_male_25+_2019']);
      const femaleEmployment = parseNumber(row['employed_female_25+_2019']);
      const laborDependency = parseNumber(row['labour_dependency_ratio']);
      const hoursLost40 = parseNumber(row['percent_hours_lost_40hrs_per_week']);
      const hoursLost48 = parseNumber(row['percent_hours_lost_48hrs_per_week']);

      // Calculate derived metrics
      const hoursLost = (totalHours * hoursLostPercentage) / 100; // Calculated from percentage
      const totalEmployment = maleEmployment + femaleEmployment;
      const genderRatio = femaleEmployment > 0 ? maleEmployment / femaleEmployment : 0;

      // Classify impact level based on percentage hours lost
      let impactLevel = 'Low';
      if (hoursLostPercentage > 15) impactLevel = 'High';
      else if (hoursLostPercentage > 8) impactLevel = 'Medium';

      // Regional classification
      const region = getRegion(row.country);

      return {
        country: row.country,
        hoursLost,
        totalHours,
        maleEmployment,
        femaleEmployment,
        laborDependency,
        impactPercentage: hoursLostPercentage,
        totalEmployment,
        genderRatio,
        impactLevel,
        region,
        hoursLost40,
        hoursLost48,
        rawData: row
      };
    })
    .filter(item => item.totalEmployment > 0 || item.hoursLost > 0); // Filter out completely invalid data

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
  if (!data || data.length === 0) return {
    totalCountries: 0,
    totalHoursLost: 0,
    avgImpactPercentage: 0,
    totalEmployment: 0,
    highImpactCountries: 0,
    avgLaborDependency: 0,
    avgGenderRatio: 0,
    mostImpactedCountry: 'N/A'
  };

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
    if (countries.length > 0) {
      regionalStats[region].avgImpactPercentage = 
        countries.reduce((sum, c) => sum + c.impactPercentage, 0) / countries.length;
      regionalStats[region].avgLaborDependency = 
        countries.reduce((sum, c) => sum + c.laborDependency, 0) / countries.length;
    }
  });

  return regionalStats;
};
