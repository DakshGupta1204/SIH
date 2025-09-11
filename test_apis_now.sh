#!/bin/bash

echo "🚀 Testing ML API Integration - Live Test"
echo "=========================================="

# Test ML API Health Check
echo "1. Testing ML API Health..."
curl -s https://sih-rbfj.onrender.com/ | head -5

echo -e "\n2. Testing Species Verification API..."
curl -s -X POST https://sih-rbfj.onrender.com/api/species/verify \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,mockdata",
    "species": "turmeric"
  }' | head -5

echo -e "\n3. Testing Quality Prediction API..."
curl -s -X POST https://sih-rbfj.onrender.com/api/quality/predict_test \
  -H "Content-Type: application/json" \
  -d '{
    "batch_id": "TEST-001",
    "moisture": 12.5,
    "pesticide_level": 0.3
  }' | head -5

echo -e "\n4. Testing Fraud Detection API..."
curl -s -X POST https://sih-rbfj.onrender.com/api/fraud/detect_batch \
  -H "Content-Type: application/json" \
  -d '{
    "batch_data": {"age_days": 30},
    "scan_history": [],
    "location_data": {"lat_variance": 0.1, "lng_variance": 0.1}
  }' | head -5

echo -e "\n✅ API Test Complete!"