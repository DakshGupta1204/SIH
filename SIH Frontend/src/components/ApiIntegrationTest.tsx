import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useCheckMLHealthQuery, 
  useVerifySpeciesMLMutation, 
  usePredictQualityMLMutation, 
  useDetectBatchFraudMutation 
} from '@/store/slices/apiSlice';
import { CheckCircle, AlertCircle, Brain, Shield, FlaskConical, Loader2 } from 'lucide-react';

export const ApiIntegrationTest = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  // ML API Hooks
  const { data: healthData, isLoading: healthLoading, error: healthError } = useCheckMLHealthQuery();
  const [verifySpecies] = useVerifySpeciesMLMutation();
  const [predictQuality] = usePredictQualityMLMutation();
  const [detectFraud] = useDetectBatchFraudMutation();

  const runAllTests = async () => {
    setIsRunningTests(true);
    const results: Record<string, any> = {};

    try {
      // Test 1: Species Verification
      console.log('Testing Species Verification...');
      const speciesResult = await verifySpecies({
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        species: 'turmeric'
      }).unwrap();
      results.species = { success: true, data: speciesResult };
    } catch (error) {
      results.species = { success: false, error: error };
    }

    try {
      // Test 2: Quality Prediction
      console.log('Testing Quality Prediction...');
      const qualityResult = await predictQuality({
        batch_id: 'TEST-BATCH-001',
        moisture: 12.5,
        pesticide_level: 0.3,
        temperature: 25,
        humidity: 60
      }).unwrap();
      results.quality = { success: true, data: qualityResult };
    } catch (error) {
      results.quality = { success: false, error: error };
    }

    try {
      // Test 3: Fraud Detection
      console.log('Testing Fraud Detection...');
      const fraudResult = await detectFraud({
        batch_data: {
          age_days: 30,
          harvest_date: '2024-08-15T10:00:00Z',
          farmer_id: 'test-farmer-001'
        },
        scan_history: [
          { timestamp: '2024-09-01T10:00:00Z', location: { lat: 28.6139, lng: 77.2090 } }
        ],
        location_data: { lat_variance: 0.1, lng_variance: 0.1 }
      }).unwrap();
      results.fraud = { success: true, data: fraudResult };
    } catch (error) {
      results.fraud = { success: false, error: error };
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-6 w-6" />
            ML API Integration Test Dashboard
          </CardTitle>
          <CardDescription>
            Verify that all ML APIs are working correctly with the frontend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Health Check */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`${healthData ? 'border-green-200 bg-green-50' : healthError ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <CardContent className="p-4 text-center">
                {healthLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                ) : healthData ? (
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                )}
                <h4 className="font-semibold">ML Health</h4>
                <Badge className={
                  healthData ? 'bg-green-100 text-green-800' : 
                  healthError ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }>
                  {healthLoading ? 'CHECKING' : healthData ? 'HEALTHY' : 'ERROR'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold">Species Verification</h4>
                <Badge className={
                  testResults.species?.success ? 'bg-green-100 text-green-800' : 
                  testResults.species?.error ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }>
                  {testResults.species?.success ? 'PASSED' : testResults.species?.error ? 'FAILED' : 'PENDING'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <FlaskConical className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold">Quality Prediction</h4>
                <Badge className={
                  testResults.quality?.success ? 'bg-green-100 text-green-800' : 
                  testResults.quality?.error ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }>
                  {testResults.quality?.success ? 'PASSED' : testResults.quality?.error ? 'FAILED' : 'PENDING'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold">Fraud Detection</h4>
                <Badge className={
                  testResults.fraud?.success ? 'bg-green-100 text-green-800' : 
                  testResults.fraud?.error ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }>
                  {testResults.fraud?.success ? 'PASSED' : testResults.fraud?.error ? 'FAILED' : 'PENDING'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Test Button */}
          <Button 
            onClick={runAllTests} 
            disabled={isRunningTests}
            className="w-full"
          >
            {isRunningTests ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running API Tests...
              </>
            ) : (
              'Run All API Tests'
            )}
          </Button>

          {/* Health Data Display */}
          {healthData && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>ML API Health Status:</strong>
                <pre className="mt-2 text-xs bg-white p-2 rounded border">
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results:</h3>
              
              {Object.entries(testResults).map(([testName, result]) => (
                <Alert 
                  key={testName}
                  className={`${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                >
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <strong className="capitalize">{testName} API:</strong> {result.success ? 'SUCCESS' : 'FAILED'}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        {result.success ? 'View Response' : 'View Error'}
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                        {JSON.stringify(result.success ? result.data : result.error, null, 2)}
                      </pre>
                    </details>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Integration Status */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-700 mb-2">Integration Status</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>ML API URL:</strong> https://sih-rbfj.onrender.com
                </div>
                <div>
                  <strong>Backend URL:</strong> https://sih-backend-rbfj.onrender.com
                </div>
                <div>
                  <strong>Frontend:</strong> React + RTK Query + TypeScript
                </div>
                <div>
                  <strong>Status:</strong> 
                  <Badge className="ml-2 bg-blue-100 text-blue-800">INTEGRATED</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              <strong>Testing Instructions:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                <li>Click "Run All API Tests" to verify ML integration</li>
                <li>Check individual component pages (Farmer, Lab, Consumer)</li>
                <li>Monitor browser dev tools for API calls</li>
                <li>Verify real-time ML predictions work correctly</li>
              </ul>
            </AlertDescription>
          </Alert>

        </CardContent>
      </Card>
    </div>
  );
};

export default ApiIntegrationTest;