"""
ML API Server for Counterfeit Detection and Harvest Anomaly Detection
Flask server with CORS validation for frontend integration
"""

import os
import sys
import traceback
import tempfile
import pandas as pd
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from werkzeug.utils import secure_filename
from sklearn.preprocessing import StandardScaler

# Add model directories to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'counterfeit_detection_ml', 'src'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'harvest_anomaly_detection', 'src'))

# Import model-specific functions
from preprocess import preprocess_scan_logs
from utils import load_harvest_data, load_herb_rules
from anomaly_detection import detect_weekly_anomalies

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

# Model paths
COUNTERFEIT_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'counterfeit_detection_ml', 'models', 'isolation_forest.pkl')
HARVEST_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'harvest_anomaly_detection', 'models', 'isolation_forest.joblib')
HERB_RULES_PATH = os.path.join(os.path.dirname(__file__), 'harvest_anomaly_detection', 'data', 'herb_rules_dataset.csv')

# Global variables to store models
counterfeit_model = None
harvest_model = None
herb_rules_df = None
harvest_scaler = None

def load_models():
    """Load all ML models and data on startup"""
    global counterfeit_model, harvest_model, herb_rules_df, harvest_scaler
    
    try:
        # Load counterfeit detection model
        if os.path.exists(COUNTERFEIT_MODEL_PATH):
            counterfeit_model = joblib.load(COUNTERFEIT_MODEL_PATH)
            print("✅ Counterfeit detection model loaded successfully")
        else:
            print(f"⚠️  Counterfeit model not found at {COUNTERFEIT_MODEL_PATH}")
        
        # Load harvest anomaly detection model
        if os.path.exists(HARVEST_MODEL_PATH):
            harvest_model = joblib.load(HARVEST_MODEL_PATH)
            print("✅ Harvest anomaly detection model loaded successfully")
        else:
            print(f"⚠️  Harvest model not found at {HARVEST_MODEL_PATH}")
        
        # Load herb rules dataset
        if os.path.exists(HERB_RULES_PATH):
            herb_rules_df = load_herb_rules(HERB_RULES_PATH)
            print("✅ Herb rules dataset loaded successfully")
        else:
            print(f"⚠️  Herb rules not found at {HERB_RULES_PATH}")
            
        # Initialize scaler for harvest model (this should be loaded from training)
        harvest_scaler = StandardScaler()
        print("✅ Harvest scaler initialized")
        
    except Exception as e:
        print(f"❌ Error loading models: {str(e)}")
        traceback.print_exc()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'csv', 'json'}

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    status = {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': {
            'counterfeit_detection': counterfeit_model is not None,
            'harvest_anomaly_detection': harvest_model is not None,
            'herb_rules': herb_rules_df is not None
        }
    }
    return jsonify(status)

@app.route('/api/counterfeit/detect', methods=['POST'])
def detect_counterfeit():
    """
    Endpoint for counterfeit detection
    Accepts CSV file upload or JSON data
    """
    try:
        if counterfeit_model is None:
            return jsonify({
                'error': 'Counterfeit detection model not loaded',
                'status': 'error'
            }), 500
        
        # Handle file upload
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
                # Process the uploaded CSV file
                df = preprocess_scan_logs(filepath)
                
                # Clean up temporary file
                os.remove(filepath)
        
        # Handle JSON data
        elif request.is_json:
            data = request.get_json()
            if 'scan_logs' not in data:
                return jsonify({
                    'error': 'Missing scan_logs field in JSON data',
                    'status': 'error'
                }), 400
            
            # Create temporary CSV file from JSON data
            df_input = pd.DataFrame(data['scan_logs'])
            temp_file = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_scan_logs.csv')
            df_input.to_csv(temp_file, index=False)
            
            # Process the data
            df = preprocess_scan_logs(temp_file)
            
            # Clean up temporary file
            os.remove(temp_file)
        
        else:
            return jsonify({
                'error': 'No file uploaded or JSON data provided',
                'status': 'error'
            }), 400
        
        # Perform counterfeit detection
        if df.empty:
            return jsonify({
                'error': 'No valid data to process',
                'status': 'error'
            }), 400
        
        X = df[['lat', 'lon', 'scan_interval_hours', 'distance_km', 'retailer_type']]
        
        # Get anomaly scores and predictions
        anomaly_scores = counterfeit_model.decision_function(X)
        predictions = counterfeit_model.predict(X)
        
        df['anomaly_score'] = anomaly_scores
        df['is_suspicious'] = predictions == -1
        
        # Get suspicious items
        suspicious_items = df[df['is_suspicious']]
        
        response = {
            'status': 'success',
            'total_scans': len(df),
            'suspicious_count': len(suspicious_items),
            'suspicious_percentage': round((len(suspicious_items) / len(df)) * 100, 2),
            'suspicious_items': suspicious_items[['batch_id', 'anomaly_score', 'is_suspicious']].to_dict('records'),
            'summary_stats': {
                'avg_anomaly_score': float(anomaly_scores.mean()),
                'min_anomaly_score': float(anomaly_scores.min()),
                'max_anomaly_score': float(anomaly_scores.max())
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'error': f'Error processing counterfeit detection: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/harvest/detect', methods=['POST'])
def detect_harvest_anomalies():
    """
    Endpoint for harvest anomaly detection
    Accepts CSV file upload or JSON data
    """
    try:
        if harvest_model is None or herb_rules_df is None:
            return jsonify({
                'error': 'Harvest anomaly detection model or herb rules not loaded',
                'status': 'error'
            }), 500
        
        # Handle file upload
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
                # Process the uploaded CSV file
                df_harvest = load_harvest_data(filepath)
                
                # Clean up temporary file
                os.remove(filepath)
        
        # Handle JSON data
        elif request.is_json:
            data = request.get_json()
            if 'harvest_logs' not in data:
                return jsonify({
                    'error': 'Missing harvest_logs field in JSON data',
                    'status': 'error'
                }), 400
            
            # Create DataFrame from JSON data
            df_harvest = pd.DataFrame(data['harvest_logs'])
            
            # Convert timestamp if it's a string
            if 'timestamp' in df_harvest.columns:
                df_harvest['timestamp'] = pd.to_datetime(df_harvest['timestamp'])
        
        else:
            return jsonify({
                'error': 'No file uploaded or JSON data provided',
                'status': 'error'
            }), 400
        
        # Perform harvest anomaly detection
        if df_harvest.empty:
            return jsonify({
                'error': 'No valid harvest data to process',
                'status': 'error'
            }), 400
        
        # Run anomaly detection
        flagged_harvests = detect_weekly_anomalies(df_harvest, herb_rules_df, harvest_model)
        
        # Get anomalies
        anomalies = flagged_harvests[flagged_harvests['final_anomaly'] == 1]
        
        response = {
            'status': 'success',
            'total_weekly_harvests': len(flagged_harvests),
            'anomaly_count': len(anomalies),
            'anomaly_percentage': round((len(anomalies) / len(flagged_harvests)) * 100, 2) if len(flagged_harvests) > 0 else 0,
            'anomalies': anomalies[[
                'farmer_id', 'plant_type', 'year', 'week', 
                'quantity_harvested', 'region_id', 'rule_anomalies', 
                'iforest_anomaly', 'final_anomaly'
            ]].to_dict('records'),
            'summary_stats': {
                'rule_based_anomalies': len(flagged_harvests[flagged_harvests['rule_anomalies'].str.len() > 0]),
                'ml_based_anomalies': len(flagged_harvests[flagged_harvests['iforest_anomaly'] == 1]),
                'total_farmers_flagged': len(anomalies['farmer_id'].unique()) if len(anomalies) > 0 else 0
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'error': f'Error processing harvest anomaly detection: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/counterfeit/analyze', methods=['POST'])
def analyze_counterfeit_data():
    """
    Endpoint to analyze counterfeit data without detection
    Returns preprocessing results and data statistics
    """
    try:
        # Handle file upload or JSON data similar to detect_counterfeit
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
                df = preprocess_scan_logs(filepath)
                os.remove(filepath)
        
        elif request.is_json:
            data = request.get_json()
            if 'scan_logs' not in data:
                return jsonify({'error': 'Missing scan_logs field', 'status': 'error'}), 400
            
            df_input = pd.DataFrame(data['scan_logs'])
            temp_file = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_analysis.csv')
            df_input.to_csv(temp_file, index=False)
            
            df = preprocess_scan_logs(temp_file)
            os.remove(temp_file)
        
        else:
            return jsonify({'error': 'No data provided', 'status': 'error'}), 400
        
        # Generate analysis
        analysis = {
            'status': 'success',
            'data_overview': {
                'total_records': len(df),
                'unique_batch_ids': len(df['batch_id'].unique()) if 'batch_id' in df.columns else 0,
                'date_range': {
                    'start': df['timestamp'].min().isoformat() if 'timestamp' in df.columns else None,
                    'end': df['timestamp'].max().isoformat() if 'timestamp' in df.columns else None
                }
            },
            'feature_statistics': {
                'scan_interval_hours': {
                    'mean': float(df['scan_interval_hours'].mean()) if 'scan_interval_hours' in df.columns else None,
                    'std': float(df['scan_interval_hours'].std()) if 'scan_interval_hours' in df.columns else None,
                    'min': float(df['scan_interval_hours'].min()) if 'scan_interval_hours' in df.columns else None,
                    'max': float(df['scan_interval_hours'].max()) if 'scan_interval_hours' in df.columns else None
                },
                'distance_km': {
                    'mean': float(df['distance_km'].mean()) if 'distance_km' in df.columns else None,
                    'std': float(df['distance_km'].std()) if 'distance_km' in df.columns else None,
                    'min': float(df['distance_km'].min()) if 'distance_km' in df.columns else None,
                    'max': float(df['distance_km'].max()) if 'distance_km' in df.columns else None
                }
            },
            'retailer_distribution': df['retailer_type'].value_counts().to_dict() if 'retailer_type' in df.columns else {}
        }
        
        return jsonify(analysis)
    
    except Exception as e:
        return jsonify({
            'error': f'Error analyzing data: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/harvest/analyze', methods=['POST'])
def analyze_harvest_data():
    """
    Endpoint to analyze harvest data without anomaly detection
    Returns data statistics and overview
    """
    try:
        # Handle file upload or JSON data
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
                df_harvest = load_harvest_data(filepath)
                os.remove(filepath)
        
        elif request.is_json:
            data = request.get_json()
            if 'harvest_logs' not in data:
                return jsonify({'error': 'Missing harvest_logs field', 'status': 'error'}), 400
            
            df_harvest = pd.DataFrame(data['harvest_logs'])
            if 'timestamp' in df_harvest.columns:
                df_harvest['timestamp'] = pd.to_datetime(df_harvest['timestamp'])
        
        else:
            return jsonify({'error': 'No data provided', 'status': 'error'}), 400
        
        # Generate harvest analysis
        analysis = {
            'status': 'success',
            'data_overview': {
                'total_records': len(df_harvest),
                'unique_farmers': len(df_harvest['farmer_id'].unique()) if 'farmer_id' in df_harvest.columns else 0,
                'unique_plant_types': len(df_harvest['plant_type'].unique()) if 'plant_type' in df_harvest.columns else 0,
                'unique_regions': len(df_harvest['region_id'].unique()) if 'region_id' in df_harvest.columns else 0,
                'date_range': {
                    'start': df_harvest['timestamp'].min().isoformat() if 'timestamp' in df_harvest.columns else None,
                    'end': df_harvest['timestamp'].max().isoformat() if 'timestamp' in df_harvest.columns else None
                }
            },
            'harvest_statistics': {
                'total_quantity': float(df_harvest['quantity_harvested'].sum()) if 'quantity_harvested' in df_harvest.columns else None,
                'avg_quantity_per_harvest': float(df_harvest['quantity_harvested'].mean()) if 'quantity_harvested' in df_harvest.columns else None,
                'max_single_harvest': float(df_harvest['quantity_harvested'].max()) if 'quantity_harvested' in df_harvest.columns else None
            },
            'plant_type_distribution': df_harvest['plant_type'].value_counts().to_dict() if 'plant_type' in df_harvest.columns else {},
            'region_distribution': df_harvest['region_id'].value_counts().to_dict() if 'region_id' in df_harvest.columns else {}
        }
        
        return jsonify(analysis)
    
    except Exception as e:
        return jsonify({
            'error': f'Error analyzing harvest data: {str(e)}',
            'status': 'error'
        }), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({
        'error': 'File too large. Maximum size is 16MB.',
        'status': 'error'
    }), 413

@app.errorhandler(400)
def bad_request(e):
    """Handle bad request error"""
    return jsonify({
        'error': 'Bad request. Please check your input data.',
        'status': 'error'
    }), 400

@app.errorhandler(404)
def not_found(e):
    """Handle not found error"""
    return jsonify({
        'error': 'Endpoint not found.',
        'status': 'error'
    }), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server error"""
    return jsonify({
        'error': 'Internal server error. Please try again later.',
        'status': 'error'
    }), 500

if __name__ == '__main__':
    print("🚀 Starting ML API Server...")
    print("📊 Loading ML models...")
    
    # Load models on startup
    load_models()
    
    print("\n📋 Available endpoints:")
    print("  GET  /                          - Health check")
    print("  POST /api/counterfeit/detect    - Counterfeit detection")
    print("  POST /api/counterfeit/analyze   - Counterfeit data analysis")
    print("  POST /api/harvest/detect        - Harvest anomaly detection")
    print("  POST /api/harvest/analyze       - Harvest data analysis")
    print("\n🌐 Server starting on http://localhost:5000")
    print("🔗 CORS enabled for frontend integration")
    
    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )
