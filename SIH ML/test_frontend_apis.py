#!/usr/bin/env python3
"""
Test script for Frontend Integration APIs
Tests the new ML endpoints needed for frontend integration
"""

import requests
import json
import base64
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:5000"

def test_species_verification():
    """Test species verification endpoint"""
    print("🧪 Testing Species Verification API...")
    
    # Mock base64 image data
    mock_image = base64.b64encode(b"mock_image_data").decode('utf-8')
    
    test_data = {
        "image": f"data:image/jpeg;base64,{mock_image}",
        "species": "turmeric"
    }
    
    response = requests.post(f"{BASE_URL}/api/species/verify", json=test_data)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Species Verification - SUCCESS")
        print(f"   Predicted: {result.get('predicted_species')}")
        print(f"   Confidence: {result.get('confidence')}")
        print(f"   Match: {result.get('is_match')}")
        return True
    else:
        print(f"❌ Species Verification - FAILED: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_fraud_detection():
    """Test batch fraud detection endpoint"""
    print("\n🧪 Testing Fraud Detection API...")
    
    test_data = {
        "batch_data": {
            "age_days": 45,
            "harvest_date": "2024-08-15",
            "farmer_id": "farmer_123"
        },
        "scan_history": [
            {"timestamp": "2024-09-01T10:00:00Z", "location": {"lat": 12.34, "lng": 77.56}},
            {"timestamp": "2024-09-02T14:30:00Z", "location": {"lat": 12.35, "lng": 77.57}},
            {"timestamp": "2024-09-03T09:15:00Z", "location": {"lat": 12.36, "lng": 77.58}}
        ],
        "location_data": {
            "lat_variance": 0.02,
            "lng_variance": 0.02
        }
    }
    
    response = requests.post(f"{BASE_URL}/api/fraud/detect_batch", json=test_data)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Fraud Detection - SUCCESS")
        print(f"   Fraud Score: {result.get('fraud_score')}")
        print(f"   Risk Level: {result.get('risk_level')}")
        print(f"   Anomaly Detected: {result.get('anomaly_detected')}")
        print(f"   Factors: {result.get('factors')}")
        return True
    else:
        print(f"❌ Fraud Detection - FAILED: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_quality_prediction():
    """Test quality prediction endpoint"""
    print("\n🧪 Testing Quality Prediction API...")
    
    test_data = {
        "batch_id": "BATCH-123",
        "temperature": 28.5,
        "humidity": 65.2,
        "moisture": 11.5,
        "pesticide_level": 0.2,
        "soil_nitrogen": 35,
        "rainfall": 180,
        "region": 2,
        "harvest_month": 9
    }
    
    response = requests.post(f"{BASE_URL}/api/quality/predict_test", json=test_data)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Quality Prediction - SUCCESS")
        print(f"   Quality Grade: {result.get('quality_grade')}")
        print(f"   Confidence: {result.get('confidence')}")
        print(f"   Expected Pass: {result.get('expected_pass')}")
        print(f"   Factors: {result.get('factors')}")
        print(f"   Recommendation: {result.get('recommendations')}")
        return True
    else:
        print(f"❌ Quality Prediction - FAILED: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_health_check():
    """Test if the ML server is running"""
    print("🧪 Testing ML Server Health...")
    
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ ML Server - ONLINE")
            return True
        else:
            print(f"❌ ML Server - OFFLINE: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ ML Server - CONNECTION FAILED")
        print("   Make sure to run: python ml_api_server.py")
        return False

def main():
    """Run all API tests"""
    print("🚀 Testing Frontend Integration APIs")
    print("=" * 50)
    
    # Check if server is running
    if not test_health_check():
        print("\n💡 To start the ML server:")
        print("   cd 'SIH ML'")
        print("   python ml_api_server.py")
        return
    
    # Test all endpoints
    results = []
    results.append(test_species_verification())
    results.append(test_fraud_detection()) 
    results.append(test_quality_prediction())
    
    # Summary
    print("\n" + "=" * 50)
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"🎉 ALL TESTS PASSED ({passed}/{total})")
        print("\n✅ Your ML APIs are ready for frontend integration!")
        print("\n📋 Next Steps:")
        print("   1. Update your backend to call these ML APIs")
        print("   2. Set ML_API_URL in backend environment variables")
        print("   3. Test end-to-end integration")
    else:
        print(f"⚠️  SOME TESTS FAILED ({passed}/{total})")
        print("   Check the ML server logs for errors")

if __name__ == "__main__":
    main()