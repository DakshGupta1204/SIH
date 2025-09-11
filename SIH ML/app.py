from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import os
import pickle
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for web app integration

# Store loaded models in memory
MODELS = {}
SCALERS = {}

# Model configurations - Update this with your actual models
MODEL_CONFIG = {
    'classification': {
        'file': 'classification_model.pkl',
        'type': 'classifier',
        'description': 'Classification model for predicting categories'
    },
    'regression': {
        'file': 'regression_model.pkl', 
        'type': 'regressor',
        'description': 'Regression model for numerical predictions'
    },
    'recommendation': {
        'file': 'recommendation_model.pkl',
        'type': 'recommender',
        'description': 'Recommendation system model'
    },
    'quality': {
        'file': 'task3/quality_model.pkl',
        'scaler_file': 'task3/scaler.pkl',
        'type': 'classifier',
        'description': 'Quality prediction model - predicts product/service quality'
    }
}

def load_models():
    """Load all available models at startup"""
    models_dir = Path('models')
    if not models_dir.exists():
        models_dir.mkdir()
        
    for model_name, config in MODEL_CONFIG.items():
        # First check if it's an absolute path or relative to current directory
        if 'task3' in config['file']:
            model_path = Path(config['file'])
        else:
            model_path = models_dir / config['file']
            
        if model_path.exists():
            try:
                # Try different loading methods
                if model_path.suffix == '.pkl':
                    with open(model_path, 'rb') as f:
                        MODELS[model_name] = pickle.load(f)
                elif model_path.suffix == '.joblib':
                    MODELS[model_name] = joblib.load(model_path)
                    
                # Load scaler if specified
                if 'scaler_file' in config:
                    scaler_path = Path(config['scaler_file'])
                    if scaler_path.exists():
                        with open(scaler_path, 'rb') as f:
                            SCALERS[model_name] = pickle.load(f)
                        print(f"✓ Loaded scaler for: {model_name}")
                        
                print(f"✓ Loaded model: {model_name}")
            except Exception as e:
                print(f"✗ Failed to load {model_name}: {str(e)}")
        else:
            print(f"⚠ Model file not found: {model_path}")

# Load models on startup
load_models()

# Enhanced HTML template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>SIH ML API</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .endpoint { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #007bff; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; margin-right: 10px; }
        .get { background: #28a745; } .post { background: #007bff; }
        .model-list { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 10px 0; }
        code { background: #f1f3f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 SIH ML Model API</h1>
        <p>REST API service for machine learning models. Integrate directly into your web applications!</p>
        
        <div class="model-list">
            <h3>📊 Available Models:</h3>
            <ul>
                {% for model_name, config in models.items() %}
                <li><strong>{{model_name}}</strong> - {{config.description}}</li>
                {% endfor %}
            </ul>
        </div>
        
        <h2>🔌 API Endpoints:</h2>
        
        <div class="endpoint">
            <span class="method get">GET</span><strong>/</strong>
            <p>API documentation and model status</p>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span><strong>/models</strong>
            <p>List all available models and their configurations</p>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span><strong>/predict/&lt;model_name&gt;</strong>
            <p>Make predictions using a specific model</p>
            <p><strong>Request body:</strong> <code>{"features": [val1, val2, ...]} or {"data": {...}}</code></p>
            <p><strong>Example:</strong> <code>/predict/classification</code></p>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span><strong>/batch_predict/&lt;model_name&gt;</strong>
            <p>Make batch predictions for multiple samples</p>
            <p><strong>Request body:</strong> <code>{"samples": [[val1, val2], [val3, val4], ...]}</code></p>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span><strong>/health</strong>
            <p>API health check</p>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span><strong>/predict/quality</strong>
            <p>Predict quality using the task3 quality model</p>
            <p><strong>Request body:</strong> <code>{"features": [feature1, feature2, ...]}</code></p>
            <p><strong>Note:</strong> Features will be automatically scaled using the trained scaler</p>
        </div>
        
        <h3>💻 Example Usage in JavaScript:</h3>
        <pre style="background: #2d3748; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto;">
// Single prediction
fetch('/predict/classification', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({features: [1.2, 3.4, 5.6, 7.8]})
})
.then(response => response.json())
.then(data => console.log(data));

// Batch prediction
fetch('/batch_predict/regression', {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({samples: [[1,2,3], [4,5,6], [7,8,9]]})
})
.then(response => response.json())
.then(data => console.log(data));
        </pre>
    </div>
</body>
</html>
"""

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE, models=MODEL_CONFIG)

@app.route('/models')
def list_models():
    """List all available models"""
    available_models = {}
    for name, config in MODEL_CONFIG.items():
        available_models[name] = {
            'loaded': name in MODELS,
            'type': config['type'],
            'description': config['description']
        }
    return jsonify({
        'available_models': available_models,
        'total_models': len(MODEL_CONFIG),
        'loaded_models': len(MODELS)
    })

@app.route('/predict/<model_name>', methods=['POST'])
def predict_single(model_name):
    """Make single prediction with specified model"""
    try:
        if model_name not in MODELS:
            return jsonify({
                'error': f'Model "{model_name}" not found or not loaded',
                'available_models': list(MODELS.keys())
            }), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Handle different input formats
        if 'features' in data:
            features = np.array(data['features']).reshape(1, -1)
        elif 'data' in data:
            if isinstance(data['data'], list):
                features = np.array(data['data']).reshape(1, -1)
            else:
                # Handle dictionary format
                features = np.array(list(data['data'].values())).reshape(1, -1)
        else:
            return jsonify({'error': 'Please provide data as "features" or "data" key'}), 400
        
        model = MODELS[model_name]
        
        # Apply scaling if scaler is available for this model
        if model_name in SCALERS:
            scaler = SCALERS[model_name]
            features = scaler.transform(features)
        
        prediction = model.predict(features)
        
        # Get prediction probability if available (for classifiers)
        result = {
            'model': model_name,
            'prediction': prediction.tolist(),
            'input_shape': features.shape,
            'success': True
        }
        
        # Add probabilities for classification models
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(features)
            result['probabilities'] = probabilities.tolist()
            result['confidence'] = float(np.max(probabilities))
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'model': model_name,
            'success': False
        }), 500

@app.route('/batch_predict/<model_name>', methods=['POST'])
def predict_batch(model_name):
    """Make batch predictions with specified model"""
    try:
        if model_name not in MODELS:
            return jsonify({
                'error': f'Model "{model_name}" not found',
                'available_models': list(MODELS.keys())
            }), 404
        
        data = request.get_json()
        if not data or 'samples' not in data:
            return jsonify({'error': 'Please provide "samples" as array of arrays'}), 400
        
        samples = np.array(data['samples'])
        model = MODELS[model_name]
        
        # Apply scaling if scaler is available for this model
        if model_name in SCALERS:
            scaler = SCALERS[model_name]
            samples = scaler.transform(samples)
            
        predictions = model.predict(samples)
        
        result = {
            'model': model_name,
            'predictions': predictions.tolist(),
            'num_samples': len(samples),
            'success': True
        }
        
        # Add probabilities for classification models
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(samples)
            result['probabilities'] = probabilities.tolist()
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'model': model_name,
            'success': False
        }), 500

@app.route('/predict/quality/detailed', methods=['POST'])
def predict_quality_detailed():
    """Detailed quality prediction with feature interpretation"""
    try:
        if 'quality' not in MODELS:
            return jsonify({
                'error': 'Quality model not loaded',
                'message': 'Make sure quality_model.pkl and scaler.pkl exist in task3/ folder'
            }), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Handle different input formats
        if 'features' in data:
            features = np.array(data['features']).reshape(1, -1)
        elif 'data' in data:
            if isinstance(data['data'], list):
                features = np.array(data['data']).reshape(1, -1)
            else:
                features = np.array(list(data['data'].values())).reshape(1, -1)
        else:
            return jsonify({'error': 'Please provide data as "features" or "data" key'}), 400
        
        model = MODELS['quality']
        original_features = features.copy()
        
        # Apply scaling
        if 'quality' in SCALERS:
            scaler = SCALERS['quality']
            features = scaler.transform(features)
        
        prediction = model.predict(features)
        
        result = {
            'model': 'quality',
            'prediction': prediction.tolist(),
            'original_features': original_features.tolist(),
            'scaled_features': features.tolist(),
            'prediction_label': 'High Quality' if prediction[0] == 1 else 'Low Quality',
            'input_shape': features.shape,
            'success': True
        }
        
        # Add probabilities if available
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(features)
            result['probabilities'] = probabilities.tolist()
            result['confidence'] = float(np.max(probabilities))
            result['quality_score'] = float(probabilities[0][1])  # Probability of high quality
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'model': 'quality',
            'success': False
        }), 500

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'message': 'SIH ML API is running!',
        'loaded_models': list(MODELS.keys()),
        'loaded_scalers': list(SCALERS.keys()),
        'total_models': len(MODEL_CONFIG)
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': [
            'GET /',
            'GET /models', 
            'POST /predict/<model_name>',
            'POST /batch_predict/<model_name>',
            'POST /predict/quality/detailed',
            'GET /health'
        ]
    }), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("🚀 Starting SIH ML API Server...")
    print(f"📊 Loaded {len(MODELS)} models: {list(MODELS.keys())}")
    print(f"🔧 Loaded {len(SCALERS)} scalers: {list(SCALERS.keys())}")
    app.run(host='0.0.0.0', port=port, debug=False)