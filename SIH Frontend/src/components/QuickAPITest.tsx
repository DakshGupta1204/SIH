import React, { useState } from 'react';
import { useVerifySpeciesMLMutation, usePredictQualityMLMutation, useDetectBatchFraudMutation, useCheckMLHealthQuery } from '@/store/slices/apiSlice';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface TestResults {
  species?: TestResult;
  quality?: TestResult;
  fraud?: TestResult;
}

export const QuickAPITest = () => {
  const [testResults, setTestResults] = useState<TestResults>({});
  const [isTestingAll, setIsTestingAll] = useState(false);

  // ML API Hooks
  const { data: healthData, error: healthError } = useCheckMLHealthQuery();
  const [verifySpecies] = useVerifySpeciesMLMutation();
  const [predictQuality] = usePredictQualityMLMutation();
  const [detectFraud] = useDetectBatchFraudMutation();

  const testAllAPIs = async () => {
    setIsTestingAll(true);
    const results: TestResults = {};

    try {
      // Test Species Verification
      console.log('Testing Species Verification...');
      const speciesResult = await verifySpecies({
        image: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        species: 'turmeric'
      }).unwrap();
      results.species = { success: true, data: speciesResult };
    } catch (error: any) {
      results.species = { success: false, error: error?.message || 'Unknown error' };
    }

    try {
      // Test Quality Prediction
      console.log('Testing Quality Prediction...');
      const qualityResult = await predictQuality({
        batch_id: 'TEST-001',
        moisture: 12.5,
        pesticide_level: 0.3,
        temperature: 25,
        humidity: 60
      }).unwrap();
      results.quality = { success: true, data: qualityResult };
    } catch (error: any) {
      results.quality = { success: false, error: error?.message || 'Unknown error' };
    }

    try {
      // Test Fraud Detection
      console.log('Testing Fraud Detection...');
      const fraudResult = await detectFraud({
        batch_data: { age_days: 30, harvest_date: '2024-08-15T10:00:00Z', farmer_id: 'test' },
        scan_history: [{ timestamp: '2024-09-01T10:00:00Z', location: { lat: 28.6139, lng: 77.2090 } }],
        location_data: { lat_variance: 0.1, lng_variance: 0.1 }
      }).unwrap();
      results.fraud = { success: true, data: fraudResult };
    } catch (error: any) {
      results.fraud = { success: false, error: error?.message || 'Unknown error' };
    }

    setTestResults(results);
    setIsTestingAll(false);
    console.log('Test Results:', results);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🧪 Quick ML API Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Health Status:</h3>
        <div style={{ 
          padding: '10px', 
          backgroundColor: healthData ? '#d4edda' : healthError ? '#f8d7da' : '#fff3cd',
          border: '1px solid',
          borderColor: healthData ? '#c3e6cb' : healthError ? '#f5c6cb' : '#ffeaa7'
        }}>
          {healthData ? '✅ ML API is healthy' : healthError ? '❌ ML API error' : '⏳ Checking...'}
        </div>
        {healthData && (
          <pre style={{ fontSize: '12px', background: '#f8f9fa', padding: '10px', marginTop: '10px' }}>
            {JSON.stringify(healthData, null, 2)}
          </pre>
        )}
      </div>

      <button 
        onClick={testAllAPIs}
        disabled={isTestingAll}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: isTestingAll ? 'not-allowed' : 'pointer'
        }}
      >
        {isTestingAll ? '🔄 Testing APIs...' : '🚀 Test All ML APIs'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Test Results:</h3>
          {Object.entries(testResults).map(([apiName, result]) => (
            <div key={apiName} style={{ 
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: result.success ? '#d4edda' : '#f8d7da',
              border: '1px solid',
              borderColor: result.success ? '#c3e6cb' : '#f5c6cb',
              borderRadius: '5px'
            }}>
              <strong>{apiName.toUpperCase()} API:</strong> {result.success ? '✅ SUCCESS' : '❌ FAILED'}
              <details style={{ marginTop: '5px' }}>
                <summary style={{ cursor: 'pointer' }}>View Details</summary>
                <pre style={{ fontSize: '10px', marginTop: '5px', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(result.success ? result.data : result.error, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
        <p><strong>API Endpoints being tested:</strong></p>
        <ul>
          <li>Health: https://sih-rbfj.onrender.com/</li>
          <li>Species: https://sih-rbfj.onrender.com/api/species/verify</li>
          <li>Quality: https://sih-rbfj.onrender.com/api/quality/predict_test</li>
          <li>Fraud: https://sih-rbfj.onrender.com/api/fraud/detect_batch</li>
        </ul>
      </div>
    </div>
  );
};

export default QuickAPITest;