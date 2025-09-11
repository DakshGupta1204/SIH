# 📋 Complete API Reference - Backend & ML APIs

## 🔗 **Backend APIs** 
**Base URL:** `https://sih-backend-rbfj.onrender.com`

### **🔐 Authentication APIs**
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/auth/login` | User login | `{email, password}` |
| POST | `/auth/register` | User registration | `{name, email, password, role}` |
| GET | `/auth/me` | Get current user | Headers: `Authorization: Bearer <token>` |

### **👨‍🌾 Farmer APIs**
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/collection` | Create new collection | `{farmerId, species, gpsCoordinates, harvestDate, quantity, image?}` |
| GET | `/collections/:farmerId` | Get farmer collections | - |
| POST | `/collection/verify-species` | Basic species verification | `{image, species}` |

### **🏭 Processing APIs**
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/processing` | Add processing step | `{batchId, processorId, stepType, date, metadata?}` |
| GET | `/batches` | Get available batches | - |
| GET | `/batches/:batchId` | Get batch details | - |

### **🧪 Lab/Quality APIs**
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/quality-test` | Create quality test | `{batchId, labId, moisture, pesticideLevel, dnaResult, certificateFile?}` |
| GET | `/batches` | Get batches for testing | Query: `?status=processing` |

### **🛒 Consumer APIs**
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/verify/:qrCode` | Verify product authenticity | - |
| GET | `/scan-stats/:batchId` | Get scan statistics | - |

### **📊 General APIs**
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/health` | Backend health check | - |
| GET | `/batches` | Get all batches | Query: `?status=&limit=&page=` |

---

## 🤖 **ML APIs**
**Base URL:** `https://sih-rbfj.onrender.com`

### **🌿 Species Verification API**
| Method | Endpoint | Description | Body | Response |
|--------|----------|-------------|------|----------|
| POST | `/api/species/verify` | AI species verification | `{image: "data:image/jpeg;base64,...", species: "turmeric"}` | `{predicted_species, confidence, is_match, timestamp, model_version, valid_species, status}` |

### **🔬 Quality Prediction API**
| Method | Endpoint | Description | Body | Response |
|--------|----------|-------------|------|----------|
| POST | `/api/quality/predict_test` | AI quality prediction | `{batch_id, moisture, pesticide_level, temperature?, humidity?, soil_nitrogen?, rainfall?, region?, harvest_month?}` | `{quality_prediction, quality_grade, confidence, expected_pass, factors, test_results, recommendations, timestamp, batch_id, status}` |

### **🛡️ Fraud Detection API**
| Method | Endpoint | Description | Body | Response |
|--------|----------|-------------|------|----------|
| POST | `/api/fraud/detect_batch` | AI fraud detection | `{batch_data: {age_days, harvest_date, farmer_id}, scan_history: [{timestamp, location}], location_data: {lat_variance, lng_variance}}` | `{fraud_score, risk_level, anomaly_detected, confidence, factors, recommendations, timestamp, status}` |

### **❤️ Health Check API**
| Method | Endpoint | Description | Body | Response |
|--------|----------|-------------|------|----------|
| GET | `/` | ML API health status | - | `{status, timestamp, models_loaded: {counterfeit_detection, harvest_anomaly_detection, herb_rules}}` |

---

## 🔧 **Frontend Integration Status**

### **✅ Integrated Components**
| Component | ML API Used | Backend API Used | Status |
|-----------|-------------|------------------|--------|
| **NewCollection.tsx** | Species Verification | Create Collection | ✅ Working |
| **QualityTest.tsx** | Quality Prediction | Create Quality Test | ✅ Working |
| **ProductVerification.tsx** | Fraud Detection | Verify Product | ✅ Working |

### **🎯 RTK Query Hooks Available**
```typescript
// Authentication
useLoginMutation()
useRegisterMutation()
useGetCurrentUserQuery()

// Farmer Operations
useCreateCollectionMutation()
useGetFarmerCollectionsQuery()
useVerifySpeciesMutation()

// Processing Operations
useCreateProcessingStepMutation()
useGetAvailableBatchesQuery()

// Lab Operations
useCreateQualityTestMutation()
useGetBatchDetailsQuery()
useGetAllBatchesQuery()

// Consumer Operations
useVerifyProductQuery()
useGetScanStatsQuery()

// ML Operations
useVerifySpeciesMLMutation()
usePredictQualityMLMutation()
useDetectBatchFraudMutation()
useCheckMLHealthQuery()
```

---

## 📊 **API Summary**

### **Backend APIs:** 12+ endpoints
- **Authentication:** 3 endpoints
- **Farmer Operations:** 3 endpoints  
- **Processing:** 3 endpoints
- **Lab/Quality:** 3 endpoints
- **Consumer:** 2 endpoints

### **ML APIs:** 4 endpoints
- **Species Verification:** 1 endpoint
- **Quality Prediction:** 1 endpoint
- **Fraud Detection:** 1 endpoint
- **Health Check:** 1 endpoint

### **Total:** 16+ APIs integrated
- **Backend Server:** Node.js/Express + MongoDB
- **ML Server:** Python Flask + scikit-learn
- **Frontend:** React + RTK Query + TypeScript

---

## 🚀 **Usage Examples**

### **Test ML APIs:**
```bash
# Health Check
curl https://sih-rbfj.onrender.com/

# Species Verification
curl -X POST https://sih-rbfj.onrender.com/api/species/verify \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,<base64>","species":"turmeric"}'

# Quality Prediction
curl -X POST https://sih-rbfj.onrender.com/api/quality/predict_test \
  -H "Content-Type: application/json" \
  -d '{"batch_id":"TEST","moisture":12.5,"pesticide_level":0.3}'

# Fraud Detection  
curl -X POST https://sih-rbfj.onrender.com/api/fraud/detect_batch \
  -H "Content-Type: application/json" \
  -d '{"batch_data":{"age_days":30},"scan_history":[],"location_data":{}}'
```

### **Test Backend APIs:**
```bash
# Register User
curl -X POST https://sih-backend-rbfj.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"farmer"}'

# Login
curl -X POST https://sih-backend-rbfj.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

This is your complete API ecosystem for the agricultural traceability system with AI/ML integration! 🌾🤖