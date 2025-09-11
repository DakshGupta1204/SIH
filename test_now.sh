echo "🧪 Quick ML API Test"
echo "==================="

echo "Testing ML Health Check..."
curl -s https://sih-rbfj.onrender.com/ -w "\nHTTP Status: %{http_code}\n" || echo "❌ Health check failed"

echo -e "\nTesting Species Verification..."
curl -s -X POST https://sih-rbfj.onrender.com/api/species/verify \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,test","species":"turmeric"}' \
  -w "\nHTTP Status: %{http_code}\n" || echo "❌ Species verification failed"

echo -e "\nTesting Quality Prediction..."
curl -s -X POST https://sih-rbfj.onrender.com/api/quality/predict_test \
  -H "Content-Type: application/json" \
  -d '{"batch_id":"TEST-001","moisture":12.5,"pesticide_level":0.3}' \
  -w "\nHTTP Status: %{http_code}\n" || echo "❌ Quality prediction failed"

echo -e "\nTesting Fraud Detection..."
curl -s -X POST https://sih-rbfj.onrender.com/api/fraud/detect_batch \
  -H "Content-Type: application/json" \
  -d '{"batch_data":{"age_days":30},"scan_history":[],"location_data":{"lat_variance":0.1,"lng_variance":0.1}}' \
  -w "\nHTTP Status: %{http_code}\n" || echo "❌ Fraud detection failed"

echo -e "\n✅ API tests complete!"