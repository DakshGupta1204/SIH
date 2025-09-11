const https = require('https');

console.log('🧪 ML API Integration Test - Live Results');
console.log('==========================================\n');

const testAPI = (name, url, method = 'GET', data = null) => {
  return new Promise((resolve) => {
    const options = {
      method,
      headers: data ? { 'Content-Type': 'application/json' } : {},
      timeout: 10000
    };

    console.log(`Testing ${name}...`);
    
    const req = https.request(url, options, (res) => {
      let body = '';
      
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        const success = status >= 200 && status < 300;
        
        console.log(`${success ? '✅' : '❌'} ${name}`);
        console.log(`   Status: HTTP ${status}`);
        console.log(`   URL: ${url}`);
        
        if (body) {
          try {
            const parsed = JSON.parse(body);
            console.log(`   Response:`, JSON.stringify(parsed, null, 2).substring(0, 200) + '...');
          } catch (e) {
            console.log(`   Response: ${body.substring(0, 100)}...`);
          }
        }
        
        console.log('');
        resolve({ name, success, status, response: body });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${err.message}`);
      console.log('');
      resolve({ name, success: false, error: err.message });
    });

    req.on('timeout', () => {
      console.log(`⏰ ${name} - Request timeout`);
      console.log('');
      req.destroy();
      resolve({ name, success: false, error: 'timeout' });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

const runTests = async () => {
  const results = [];

  // Test 1: ML API Health Check
  results.push(await testAPI(
    'ML Health Check',
    'https://sih-rbfj.onrender.com/'
  ));

  // Test 2: Species Verification
  results.push(await testAPI(
    'Species Verification',
    'https://sih-rbfj.onrender.com/api/species/verify',
    'POST',
    {
      image: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      species: 'turmeric'
    }
  ));

  // Test 3: Quality Prediction
  results.push(await testAPI(
    'Quality Prediction',
    'https://sih-rbfj.onrender.com/api/quality/predict_test',
    'POST',
    {
      batch_id: 'TEST-BATCH-001',
      moisture: 12.5,
      pesticide_level: 0.3,
      temperature: 25,
      humidity: 60
    }
  ));

  // Test 4: Fraud Detection
  results.push(await testAPI(
    'Fraud Detection',
    'https://sih-rbfj.onrender.com/api/fraud/detect_batch',
    'POST',
    {
      batch_data: {
        age_days: 30,
        harvest_date: '2024-08-15T10:00:00Z',
        farmer_id: 'test-farmer-001'
      },
      scan_history: [
        { timestamp: '2024-09-01T10:00:00Z', location: { lat: 28.6139, lng: 77.2090 } }
      ],
      location_data: { lat_variance: 0.1, lng_variance: 0.1 }
    }
  ));

  // Test Summary
  console.log('📊 TEST SUMMARY');
  console.log('================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });

  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! Your ML API integration is working perfectly!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Start frontend: cd "SIH Frontend" && npm run dev');
    console.log('   2. Test ML features in the UI');
    console.log('   3. Deploy to production');
  } else {
    console.log('\n⚠️  Some tests failed. Check the ML API server status.');
    console.log('   ML API URL: https://sih-rbfj.onrender.com');
  }
};

// Run the tests
runTests().catch(console.error);