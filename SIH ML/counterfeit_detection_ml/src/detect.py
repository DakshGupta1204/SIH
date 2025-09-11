import pandas as pd
import joblib
from preprocess import preprocess_scan_logs

# Load pre-trained model
model = joblib.load("../counterfeit_detection_ml/models/isolation_forest.pkl")

def detect_counterfeit(filepath):
    df = preprocess_scan_logs(filepath)
    X = df[['lat', 'lon', 'scan_interval_hours', 'distance_km', 'retailer_type']]
    
    df['anomaly_score'] = model.decision_function(X)
    df['is_suspicious'] = model.predict(X) == -1
    
    suspicious = df[df['is_suspicious']][['batch_id', 'anomaly_score']]
    return suspicious

if __name__ == "__main__":
    suspicious = detect_counterfeit("../counterfeit_detection_ml/data/scan_logs_sample.csv")
    print("🚨 Suspicious scans detected:")
    print(suspicious)
