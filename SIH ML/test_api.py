"""
Test script for ML API Server
Tests both counterfeit detection and harvest anomaly detection endpoints
"""

import requests

# API base URL
BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            print(f"📊 Models loaded: {data['models_loaded']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_counterfeit_detection():
    """Test counterfeit detection endpoint with sample data"""
    print("\n🔍 Testing counterfeit detection...")
    
    # Sample scan log data
    sample_data = {
        "scan_logs": [
            {
                "batch_id": "B001",
                "timestamp": "2024-01-15T10:30:00",
                "lat": 28.6139,
                "lon": 77.2090,
                "retailer_id": "R001"
            },
            {
                "batch_id": "B002", 
                "timestamp": "2024-01-15T11:45:00",
                "lat": 28.7041,
                "lon": 77.1025,
                "retailer_id": "R002"
            },
            {
                "batch_id": "B003",
                "timestamp": "2024-01-15T14:20:00", 
                "lat": 19.0760,
                "lon": 72.8777,
                "retailer_id": "R003"
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/counterfeit/detect",
            json=sample_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Counterfeit detection successful")
            print(f"📊 Total scans: {data.get('total_scans', 0)}")
            print(f"🚨 Suspicious count: {data.get('suspicious_count', 0)}")
            print(f"📈 Suspicious percentage: {data.get('suspicious_percentage', 0)}%")
            return True
        else:
            print(f"❌ Counterfeit detection failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Counterfeit detection error: {e}")
        return False

def test_harvest_anomaly_detection():
    """Test harvest anomaly detection endpoint with sample data"""
    print("\n🔍 Testing harvest anomaly detection...")
    
    # Sample harvest data
    sample_data = {
        "harvest_logs": [
            {
                "farmer_id": "F001",
                "plant_type": "tomato",
                "timestamp": "2024-01-15T08:00:00",
                "quantity_harvested": 150.5,
                "region_id": "R001",
                "geo_lat": 28.6139,
                "geo_lon": 77.2090
            },
            {
                "farmer_id": "F002",
                "plant_type": "potato", 
                "timestamp": "2024-01-15T09:30:00",
                "quantity_harvested": 200.0,
                "region_id": "R002",
                "geo_lat": 28.7041,
                "geo_lon": 77.1025
            },
            {
                "farmer_id": "F003",
                "plant_type": "wheat",
                "timestamp": "2024-01-15T10:45:00",
                "quantity_harvested": 500.0,
                "region_id": "R003", 
                "geo_lat": 19.0760,
                "geo_lon": 72.8777
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/harvest/detect",
            json=sample_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Harvest anomaly detection successful")
            print(f"📊 Total weekly harvests: {data.get('total_weekly_harvests', 0)}")
            print(f"🚨 Anomaly count: {data.get('anomaly_count', 0)}")
            print(f"📈 Anomaly percentage: {data.get('anomaly_percentage', 0)}%")
            return True
        else:
            print(f"❌ Harvest anomaly detection failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Harvest anomaly detection error: {e}")
        return False

def test_data_analysis():
    """Test data analysis endpoints"""
    print("\n🔍 Testing data analysis endpoints...")
    
    # Test counterfeit analysis
    counterfeit_data = {
        "scan_logs": [
            {
                "batch_id": "B001",
                "timestamp": "2024-01-15T10:30:00",
                "lat": 28.6139,
                "lon": 77.2090,
                "retailer_id": "R001"
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/counterfeit/analyze",
            json=counterfeit_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Counterfeit analysis successful")
        else:
            print(f"❌ Counterfeit analysis failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Counterfeit analysis error: {e}")
    
    # Test harvest analysis
    harvest_data = {
        "harvest_logs": [
            {
                "farmer_id": "F001",
                "plant_type": "tomato",
                "timestamp": "2024-01-15T08:00:00",
                "quantity_harvested": 150.5,
                "region_id": "R001",
                "geo_lat": 28.6139,
                "geo_lon": 77.2090
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/harvest/analyze",
            json=harvest_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Harvest analysis successful")
        else:
            print(f"❌ Harvest analysis failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Harvest analysis error: {e}")

def main():
    """Run all tests"""
    print("🧪 Starting ML API Server Tests")
    print("=" * 50)
    
    # Test health check first
    if not test_health_check():
        print("\n❌ Server not responding. Make sure the API server is running:")
        print("   python ml_api_server.py")
        return
    
    # Run API tests
    test_counterfeit_detection()
    test_harvest_anomaly_detection() 
    test_data_analysis()
    
    print("\n" + "=" * 50)
    print("🧪 Tests completed")
    print("\n💡 Note: Some tests may fail if model files are missing.")
    print("   Ensure all required model files and data are in place.")

if __name__ == "__main__":
    main()
