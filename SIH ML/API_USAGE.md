# SIH ML API - Usage Examples

## 🚀 Quick Start

1. **Create sample models** (for testing):
   ```bash
   python create_sample_models.py
   ```

2. **Start the API server**:
   ```bash
   python app.py
   ```

3. **Visit** http://localhost:5000 to see the API documentation

## 📡 API Endpoints

### Single Prediction
```bash
curl -X POST http://localhost:5000/predict/classification \
  -H "Content-Type: application/json" \
  -d '{"features": [1.2, 3.4, 5.6, 7.8, 9.0, 1.1, 2.2, 3.3, 4.4, 5.5]}'
```

### Batch Prediction
```bash
curl -X POST http://localhost:5000/batch_predict/regression \
  -H "Content-Type: application/json" \
  -d '{"samples": [[1,2,3,4,5,6,7,8], [9,8,7,6,5,4,3,2], [5,5,5,5,5,5,5,5]]}'
```

### List Models
```bash
curl http://localhost:5000/models
```

## 🌐 JavaScript Integration

### React/Vue/Angular Example:
```javascript
// Single prediction
async function predict(modelName, features) {
  const response = await fetch(`/predict/${modelName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ features })
  });
  
  const result = await response.json();
  return result;
}

// Usage
predict('classification', [1.2, 3.4, 5.6, 7.8, 9.0, 1.1, 2.2, 3.3, 4.4, 5.5])
  .then(result => {
    console.log('Prediction:', result.prediction);
    console.log('Confidence:', result.confidence);
  });

// Batch prediction
async function batchPredict(modelName, samples) {
  const response = await fetch(`/batch_predict/${modelName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ samples })
  });
  
  return await response.json();
}
```

### jQuery Example:
```javascript
$.ajax({
  url: '/predict/classification',
  type: 'POST',
  contentType: 'application/json',
  data: JSON.stringify({
    features: [1.2, 3.4, 5.6, 7.8, 9.0, 1.1, 2.2, 3.3, 4.4, 5.5]
  }),
  success: function(result) {
    console.log('Prediction:', result.prediction);
    $('#result').html('Prediction: ' + result.prediction[0]);
  }
});
```

## 🔧 Adding Your Own Models

1. **Save your trained model**:
   ```python
   import pickle
   
   # Train your model
   model = YourMLModel()
   model.fit(X_train, y_train)
   
   # Save it
   with open('models/your_model.pkl', 'wb') as f:
       pickle.dump(model, f)
   ```

2. **Update MODEL_CONFIG in app.py**:
   ```python
   MODEL_CONFIG = {
       'your_model': {
           'file': 'your_model.pkl',
           'type': 'classifier',  # or 'regressor'
           'description': 'Your model description'
       }
   }
   ```

3. **Restart the server** and your model will be available at `/predict/your_model`

## 🌍 Deploy to Production

Follow the instructions in `DEPLOY.md` to deploy to Render, Heroku, or any cloud platform.

## 📊 Response Format

### Single Prediction Response:
```json
{
  "model": "classification",
  "prediction": [2],
  "probabilities": [[0.1, 0.2, 0.7]],
  "confidence": 0.7,
  "input_shape": [1, 10],
  "success": true
}
```

### Batch Prediction Response:
```json
{
  "model": "regression", 
  "predictions": [45.2, 67.8, 23.1],
  "num_samples": 3,
  "success": true
}
```