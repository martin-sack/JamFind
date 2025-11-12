// Simple test script to verify analytics endpoints
// Run with: node scripts/test-analytics.js

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    console.log(`✅ ${endpoint}:`, data);
    return true;
  } catch (error) {
    console.log(`❌ ${endpoint}:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing JamFind Analytics Endpoints...\n');
  
  const endpoints = [
    '/api/admin/analytics/overview',
    '/api/admin/analytics/top',
    '/api/cron/update-charts'
  ];
  
  let passed = 0;
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) passed++;
  }
  
  console.log(`\n📊 Results: ${passed}/${endpoints.length} endpoints working`);
  
  if (passed === endpoints.length) {
    console.log('🎉 All analytics endpoints are working correctly!');
  } else {
    console.log('⚠️ Some endpoints need attention. Check database connection.');
  }
}

runTests();
