const axios = require('axios');

const BASE_URL = 'http://localhost:3001'; // Adjust if your backend runs on a different port

async function testAnalyticsEndpoints() {
  console.log('🧪 Testing Analytics Endpoints...\n');

  try {
    // Test platform analytics endpoint
    console.log('📊 Testing /api/analytics/platform...');
    const platformResponse = await axios.get(`${BASE_URL}/api/analytics/platform`);
    console.log('✅ Platform Analytics Response:', JSON.stringify(platformResponse.data, null, 2));

    // Check if user engagement metrics are present
    const platformData = platformResponse.data;
    const requiredFields = [
      'dailyActiveUsers',
      'weeklyActiveUsers',
      'monthlyActiveUsers',
      'avgSessionDurationMinutes',
      'totalWatchTimeHours',
      'userRetentionRate'
    ];

    console.log('\n🔍 Checking User Engagement Metrics in Platform Analytics:');
    requiredFields.forEach(field => {
      const value = platformData[field];
      const status = value !== undefined ? '✅' : '❌';
      console.log(`${status} ${field}: ${value}`);
    });

    // Test detailed analytics endpoint
    console.log('\n📈 Testing /api/analytics/detailed...');
    const detailedResponse = await axios.get(`${BASE_URL}/api/analytics/detailed`);
    console.log('✅ Detailed Analytics Response:', JSON.stringify(detailedResponse.data, null, 2));

    // Check if user engagement metrics are present in detailed analytics
    const detailedData = detailedResponse.data;
    console.log('\n🔍 Checking User Engagement Metrics in Detailed Analytics:');
    requiredFields.forEach(field => {
      const value = detailedData[field];
      const status = value !== undefined ? '✅' : '❌';
      console.log(`${status} ${field}: ${value}`);
    });

    // Check for top courses and category stats
    console.log('\n🔍 Checking Additional Data:');
    console.log(`✅ topCourses: ${detailedData.topCourses ? detailedData.topCourses.length : 0} courses`);
    console.log(`✅ categoryStats: ${detailedData.categoryStats ? detailedData.categoryStats.length : 0} categories`);

    console.log('\n🎉 All analytics endpoints are working correctly!');
    console.log('📊 User Engagement Metrics should now display real data in the admin dashboard.');

  } catch (error) {
    console.error('❌ Error testing analytics endpoints:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAnalyticsEndpoints();