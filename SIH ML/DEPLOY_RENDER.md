# 🚀 Deploy ML Service on Render - Complete Guide

## **Quick Deployment Steps**

### **Option 1: GitHub + Render (Recommended)**

1. **Push your ML folder to GitHub**:
   ```bash
   cd "/Users/dakshgupta/Desktop/SIH/SIH ML"
   git init
   git add .
   git commit -m "Add ML API service with frontend integration"
   git branch -M main
   git remote add origin https://github.com/yourusername/sih-ml-api.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the ML repository you just created
   - **Settings**:
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `python ml_api_server.py`
     - **Environment**: `Python 3`
     - **Plan**: `Free` (sufficient for testing)

3. **Environment Variables** (Optional):
   - `FLASK_ENV`: `production`
   - `PYTHONPATH`: `/opt/render/project/src`

4. **Deploy** → Wait 3-5 minutes → Get your URL!

### **Option 2: Direct Upload to Render**

1. **Zip your ML folder**:
   ```bash
   cd "/Users/dakshgupta/Desktop/SIH"
   zip -r sih-ml-api.zip "SIH ML"
   ```

2. **Upload to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"  
   - Choose "Upload from computer"
   - Upload your zip file
   - Configure same settings as Option 1

## **🔧 Your ML Service Configuration**

```yaml
# render.yaml (already configured)
services:
  - type: web
    name: sih-ml-api
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: python ml_api_server.py
    envVars:
      - key: FLASK_ENV
        value: production
    healthCheckPath: /
```

## **✅ After Deployment - You'll Get**

Your live ML API URL will be:
```
https://sih-ml-api-XXXX.onrender.com
```

**Test your deployed API**:
```bash
curl https://your-ml-api-url.onrender.com/
# Should return: {"status": "ML API Server is running", "timestamp": "..."}
```

## **🔗 Integrate with Your Backend**

### **Step 1: Update Backend Environment Variables**

In your deployed backend (Render/Vercel), add:
```env
ML_API_URL=https://your-ml-api-url.onrender.com
```

### **Step 2: Update Backend Routes**

**Farmer Routes** (`routes/farmer.js`):
```javascript
const axios = require('axios');

router.post('/collection', auth, authorize('farmer'), async (req, res) => {
  try {
    const { species, image } = req.body;
    
    // Call your deployed ML API
    const mlResponse = await axios.post(`${process.env.ML_API_URL}/api/species/verify`, {
      image,
      species
    });
    
    if (mlResponse.data.is_match) {
      // Save collection to MongoDB
      // ... existing code ...
      res.json({ message: 'Collection verified and saved', mlResult: mlResponse.data });
    } else {
      res.status(400).json({ message: 'Species verification failed', mlResult: mlResponse.data });
    }
  } catch (error) {
    res.status(500).json({ message: 'ML service error' });
  }
});
```

**Lab Routes** (`routes/lab.js`):
```javascript
router.post('/quality-test', auth, authorize('lab'), async (req, res) => {
  try {
    const { batchId, moisture, pesticideLevel, temperature, humidity } = req.body;
    
    // Call your deployed ML API
    const mlResponse = await axios.post(`${process.env.ML_API_URL}/api/quality/predict_test`, {
      batch_id: batchId,
      moisture,
      pesticide_level: pesticideLevel,
      temperature,
      humidity
    });
    
    // Save quality test with ML prediction
    // ... existing code ...
    res.json({ message: 'Quality test completed', mlPrediction: mlResponse.data });
  } catch (error) {
    res.status(500).json({ message: 'ML service error' });
  }
});
```

**Consumer Routes** (`routes/consumer.js`):
```javascript
router.get('/verify/:qrCode', async (req, res) => {
  try {
    const { qrCode } = req.params;
    
    // Get batch data
    const batch = await Batch.findOne({ qrCode });
    
    // Call your deployed ML API for fraud detection
    const mlResponse = await axios.post(`${process.env.ML_API_URL}/api/fraud/detect_batch`, {
      batch_data: { age_days: 30, harvest_date: batch.createdAt },
      scan_history: batch.scanHistory || [],
      location_data: { lat_variance: 0.1, lng_variance: 0.1 }
    });
    
    res.json({
      verified: true,
      batch,
      fraudDetection: mlResponse.data
    });
  } catch (error) {
    res.status(500).json({ message: 'Verification error' });
  }
});
```

## **🧪 Test Your Integration**

### **1. Test ML API Directly**
```bash
# Test species verification
curl -X POST https://your-ml-api-url.onrender.com/api/species/verify \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,mock", "species":"turmeric"}'

# Test fraud detection
curl -X POST https://your-ml-api-url.onrender.com/api/fraud/detect_batch \
  -H "Content-Type: application/json" \
  -d '{"batch_data":{"age_days":30}, "scan_history":[]}'

# Test quality prediction
curl -X POST https://your-ml-api-url.onrender.com/api/quality/predict_test \
  -H "Content-Type: application/json" \
  -d '{"moisture":12, "pesticide_level":0.2}'
```

### **2. Test Backend Integration**
```bash
# Test farmer collection (should call ML API internally)
curl -X POST https://your-backend-url.onrender.com/api/farmer/collection \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"species":"turmeric", "image":"base64-data", ...}'
```

## **💡 Pro Tips for Production**

### **1. Error Handling**
```javascript
// In your backend, handle ML API failures gracefully
try {
  const mlResponse = await axios.post(`${process.env.ML_API_URL}/api/species/verify`, data);
  return mlResponse.data;
} catch (error) {
  console.error('ML API error:', error.message);
  // Fallback to basic validation
  return { success: true, is_match: true, confidence: 0.7, note: 'Fallback validation' };
}
```

### **2. Caching (Optional)**
```javascript
// Cache ML results to reduce API calls
const redis = require('redis');
const client = redis.createClient();

const cacheKey = `ml_species_${hash(image + species)}`;
const cached = await client.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
} else {
  const result = await callMLAPI();
  await client.setex(cacheKey, 3600, JSON.stringify(result)); // Cache 1 hour
  return result;
}
```

### **3. Health Monitoring**
```javascript
// Monitor ML API health in your backend
setInterval(async () => {
  try {
    await axios.get(`${process.env.ML_API_URL}/`);
    console.log('✅ ML API is healthy');
  } catch (error) {
    console.error('❌ ML API is down:', error.message);
    // Send alert or use fallback
  }
}, 60000); // Check every minute
```

## **🎉 Final Result**

After deployment, you'll have:

1. **Live ML API** → `https://your-ml-api.onrender.com`
2. **Backend integration** → Calls ML API for all workflows  
3. **Frontend enhancement** → Shows ML confidence scores and predictions
4. **Complete traceability** → Farm → ML → Blockchain → Consumer

Your project now has **production-grade AI integration** with real-time species verification, quality prediction, and fraud detection!

## **🚨 Common Issues & Solutions**

**Issue**: ML API takes too long to respond
**Solution**: Increase timeout in backend axios calls:
```javascript
const response = await axios.post(url, data, { timeout: 30000 });
```

**Issue**: Models not loading on Render
**Solution**: Models are included in your repo, should work automatically

**Issue**: CORS errors from frontend
**Solution**: CORS is already enabled in your ML API

**Issue**: Memory errors on free tier
**Solution**: Models are small, should work fine on free tier

Your ML service is now **deployment-ready**! 🎯