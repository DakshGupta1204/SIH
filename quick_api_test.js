#!/usr/bin/env node

const https = require('https');

console.log('🔍 Quick API Integration Verification');
console.log('=====================================');

const testEndpoint = (name, url, data = null) => {
  return new Promise((resolve) => {
    const options = {
      method: data ? 'POST' : 'GET',
      headers: data ? { 'Content-Type': 'application/json' } : {}
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`${res.statusCode === 200 ? '✅' : '❌'} ${name}: HTTP ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            console.log(`   Response: ${Object.keys(parsed).length} fields returned`);
          } catch (e) {
            console.log(`   Response: ${responseData.length} bytes received`);
          }
        }
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${name}: ${err.message}`);
      resolve(false);
    });

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

const runTests = async () => {
  console.log('\n🧪 Testing ML API Endpoints...\n');

  // Test 1: Health Check
  await testEndpoint(
    'ML Health Check',
    'https://sih-rbfj.onrender.com/'
  );

  // Test 2: Species Verification
  await testEndpoint(
    'Species Verification', 
    'https://sih-rbfj.onrender.com/api/species/verify',
    {
      image: 'data:image/jpeg;base64,mockdata',
      species: 'turmeric'
    }
  );

  // Test 3: Quality Prediction  
  await testEndpoint(
    'Quality Prediction',
    'https://sih-rbfj.onrender.com/api/quality/predict_test',
    {
      batch_id: 'TEST-001',
      moisture: 12.5,
      pesticide_level: 0.3
    }
  );

  // Test 4: Fraud Detection
  await testEndpoint(
    'Fraud Detection',
    'https://sih-rbfj.onrender.com/api/fraud/detect_batch',
    {
      batch_data: { age_days: 30 },
      scan_history: [],
      location_data: { lat_variance: 0.1, lng_variance: 0.1 }
    }
  );

  console.log('\n🎉 Integration verification complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. cd "SIH Frontend" && npm run dev');
  console.log('   2. Test ML features in browser');
  console.log('   3. Check browser dev tools for API calls');
};

runTests();