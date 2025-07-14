// Test script to verify employment data parsing
import { loadEmploymentData, getEmploymentSummaryStats } from './employmentDataParser.js';

const testDataLoading = async () => {
  try {
    console.log('Testing employment data loading...');
    const data = await loadEmploymentData();
    console.log('Data loaded successfully:', data.length, 'countries');
    console.log('Sample data:', data.slice(0, 3));
    
    const stats = getEmploymentSummaryStats(data);
    console.log('Summary stats:', stats);
    
    return { success: true, data, stats };
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.message };
  }
};

// Export for testing
export default testDataLoading;
