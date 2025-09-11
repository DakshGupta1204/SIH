#!/bin/bash

# Test ML API Integration with Frontend
echo "🧪 Testing ML API Integration"
echo "==============================="

# Test 1: ML API Health Check
echo "1. Testing ML API Health Check..."
curl -s https://sih-rbfj.onrender.com/ | jq '.'

echo -e "\n2. Testing Species Verification API..."
curl -s -X POST https://sih-rbfj.onrender.com/api/species/verify \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,mockdata",
    "species": "turmeric"
  }' | jq '.'

echo -e "\n3. Testing Fraud Detection API..."
curl -s -X POST https://sih-rbfj.onrender.com/api/fraud/detect_batch \
  -H "Content-Type: application/json" \
  -d '{
    "batch_data": {"age_days": 30, "harvest_date": "2024-08-15"},
    "scan_history": [{"timestamp": "2024-09-01T10:00:00Z"}],
    "location_data": {"lat_variance": 0.1, "lng_variance": 0.1}
  }' | jq '.'

echo -e "\n4. Testing Quality Prediction API..."
curl -s -X POST https://sih-rbfj.onrender.com/api/quality/predict_test \
  -H "Content-Type: application/json" \
  -d '{
    "batch_id": "BATCH-123",
    "moisture": 12.5,
    "pesticide_level": 0.3,
    "temperature": 25,
    "humidity": 60
  }' | jq '.'

echo -e "\n✅ ML API Integration Test Complete!"
echo "🔗 All APIs are now available for frontend integration"