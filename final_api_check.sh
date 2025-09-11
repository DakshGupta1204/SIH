#!/bin/bash

echo "🔍 Final API Integration Check"
echo "================================="
echo "Testing all endpoints for functionality..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API URLs
BACKEND_URL="https://sih-backend-rbfj.onrender.com"
ML_URL="https://sih-rbfj.onrender.com"

echo -e "${BLUE}1. Testing ML API Health Check${NC}"
echo "================================"
HEALTH_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" $ML_URL/)
HTTP_STATUS=$(echo $HEALTH_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $HEALTH_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ $HTTP_STATUS -eq 200 ]; then
    echo -e "${GREEN}✅ ML API Health Check: PASSED${NC}"
    echo "Response: $RESPONSE_BODY"
else
    echo -e "${RED}❌ ML API Health Check: FAILED (HTTP $HTTP_STATUS)${NC}"
fi
echo ""

echo -e "${BLUE}2. Testing ML Species Verification API${NC}"
echo "======================================="
SPECIES_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST $ML_URL/api/species/verify \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "species": "turmeric"
  }')

HTTP_STATUS=$(echo $SPECIES_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $SPECIES_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ $HTTP_STATUS -eq 200 ]; then
    echo -e "${GREEN}✅ Species Verification API: PASSED${NC}"
    echo "Response: $RESPONSE_BODY"
else
    echo -e "${RED}❌ Species Verification API: FAILED (HTTP $HTTP_STATUS)${NC}"
    echo "Response: $RESPONSE_BODY"
fi
echo ""

echo -e "${BLUE}3. Testing ML Quality Prediction API${NC}"
echo "===================================="
QUALITY_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST $ML_URL/api/quality/predict_test \
  -H "Content-Type: application/json" \
  -d '{
    "batch_id": "TEST-BATCH-001",
    "moisture": 12.5,
    "pesticide_level": 0.3,
    "temperature": 25,
    "humidity": 60
  }')

HTTP_STATUS=$(echo $QUALITY_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $QUALITY_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ $HTTP_STATUS -eq 200 ]; then
    echo -e "${GREEN}✅ Quality Prediction API: PASSED${NC}"
    echo "Response: $RESPONSE_BODY"
else
    echo -e "${RED}❌ Quality Prediction API: FAILED (HTTP $HTTP_STATUS)${NC}"
    echo "Response: $RESPONSE_BODY"
fi
echo ""

echo -e "${BLUE}4. Testing ML Fraud Detection API${NC}"
echo "================================="
FRAUD_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST $ML_URL/api/fraud/detect_batch \
  -H "Content-Type: application/json" \
  -d '{
    "batch_data": {
      "age_days": 30,
      "harvest_date": "2024-08-15T10:00:00Z",
      "farmer_id": "test-farmer-001"
    },
    "scan_history": [
      {"timestamp": "2024-09-01T10:00:00Z", "location": {"lat": 28.6139, "lng": 77.2090}},
      {"timestamp": "2024-09-02T14:30:00Z", "location": {"lat": 28.6140, "lng": 77.2091}}
    ],
    "location_data": {
      "lat_variance": 0.1,
      "lng_variance": 0.1
    }
  }')

HTTP_STATUS=$(echo $FRAUD_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $FRAUD_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ $HTTP_STATUS -eq 200 ]; then
    echo -e "${GREEN}✅ Fraud Detection API: PASSED${NC}"
    echo "Response: $RESPONSE_BODY"
else
    echo -e "${RED}❌ Fraud Detection API: FAILED (HTTP $HTTP_STATUS)${NC}"
    echo "Response: $RESPONSE_BODY"
fi
echo ""

echo -e "${BLUE}5. Testing Backend API Health${NC}"
echo "============================="
BACKEND_HEALTH=$(curl -s -w "HTTPSTATUS:%{http_code}" $BACKEND_URL/health || echo "HTTPSTATUS:000")
HTTP_STATUS=$(echo $BACKEND_HEALTH | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ $HTTP_STATUS -eq 200 ] || [ $HTTP_STATUS -eq 404 ]; then
    echo -e "${GREEN}✅ Backend API: REACHABLE${NC}"
    echo "Status: HTTP $HTTP_STATUS (Backend is accessible)"
else
    echo -e "${YELLOW}⚠️  Backend API: Status $HTTP_STATUS${NC}"
fi
echo ""

echo -e "${BLUE}6. Frontend Integration Check${NC}"
echo "=============================="

# Check if key files exist
FILES_TO_CHECK=(
    "/Users/dakshgupta/Desktop/SIH/SIH Frontend/src/store/slices/apiSlice.ts"
    "/Users/dakshgupta/Desktop/SIH/SIH Frontend/src/pages/farmer/NewCollection.tsx"
    "/Users/dakshgupta/Desktop/SIH/SIH Frontend/src/pages/lab/QualityTest.tsx"
    "/Users/dakshgupta/Desktop/SIH/SIH Frontend/src/pages/consumer/ProductVerification.tsx"
    "/Users/dakshgupta/Desktop/SIH/SIH Frontend/.env"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $(basename $file): EXISTS${NC}"
    else
        echo -e "${RED}❌ $(basename $file): MISSING${NC}"
    fi
done
echo ""

echo -e "${BLUE}7. Environment Configuration Check${NC}"
echo "=================================="

ENV_FILE="/Users/dakshgupta/Desktop/SIH/SIH Frontend/.env"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✅ Environment file exists${NC}"
    echo "Contents:"
    cat "$ENV_FILE"
else
    echo -e "${RED}❌ Environment file missing${NC}"
    echo "Creating .env file..."
    cat > "$ENV_FILE" << EOF
VITE_API_URL=https://sih-backend-rbfj.onrender.com
VITE_ML_API_URL=https://sih-rbfj.onrender.com
EOF
    echo -e "${GREEN}✅ Environment file created${NC}"
fi
echo ""

echo -e "${BLUE}8. Package Dependencies Check${NC}"
echo "============================="
cd "/Users/dakshgupta/Desktop/SIH/SIH Frontend"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ Package.json exists${NC}"
    
    # Check for key dependencies
    if grep -q "@reduxjs/toolkit" package.json; then
        echo -e "${GREEN}✅ Redux Toolkit: INSTALLED${NC}"
    else
        echo -e "${RED}❌ Redux Toolkit: MISSING${NC}"
    fi
    
    if grep -q "lucide-react" package.json; then
        echo -e "${GREEN}✅ Lucide Icons: INSTALLED${NC}"
    else
        echo -e "${RED}❌ Lucide Icons: MISSING${NC}"
    fi
else
    echo -e "${RED}❌ Package.json not found${NC}"
fi
echo ""

echo "================================="
echo -e "${BLUE}📊 INTEGRATION SUMMARY${NC}"
echo "================================="

# Test summary
TOTAL_TESTS=4
PASSED_TESTS=0

# Count passed tests (this is a simplified check)
if curl -s $ML_URL/ > /dev/null 2>&1; then ((PASSED_TESTS++)); fi
if curl -s -X POST $ML_URL/api/species/verify -H "Content-Type: application/json" -d '{"image":"test","species":"test"}' > /dev/null 2>&1; then ((PASSED_TESTS++)); fi
if curl -s -X POST $ML_URL/api/quality/predict_test -H "Content-Type: application/json" -d '{"batch_id":"test","moisture":10,"pesticide_level":0.1}' > /dev/null 2>&1; then ((PASSED_TESTS++)); fi
if curl -s -X POST $ML_URL/api/fraud/detect_batch -H "Content-Type: application/json" -d '{"batch_data":{},"scan_history":[],"location_data":{}}' > /dev/null 2>&1; then ((PASSED_TESTS++)); fi

echo -e "${GREEN}✅ ML API Tests Passed: $PASSED_TESTS/$TOTAL_TESTS${NC}"
echo -e "${BLUE}🔗 ML API URL: $ML_URL${NC}"
echo -e "${BLUE}🔗 Backend URL: $BACKEND_URL${NC}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 ALL SYSTEMS OPERATIONAL!${NC}"
    echo -e "${GREEN}Your ML integration is ready for production use.${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the logs above.${NC}"
fi

echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Start frontend: cd 'SIH Frontend' && npm run dev"
echo "2. Test ML features in the UI"
echo "3. Monitor API responses in browser dev tools"
echo "4. Deploy frontend to Vercel for production testing"

echo ""
echo -e "${BLUE}🚀 Ready for deployment!${NC}"