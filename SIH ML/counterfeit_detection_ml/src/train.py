import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
from preprocess import preprocess_scan_logs

# Load and preprocess training data
df = preprocess_scan_logs("../counterfeit_detection_ml/data/scan_logs_sample.csv")

# Train Isolation Forest
X = df[['lat', 'lon', 'scan_interval_hours', 'distance_km', 'retailer_type']]
model = IsolationForest(contamination=0.2891, random_state=42)
model.fit(X)

# Save model
joblib.dump(model, "../counterfeit_detection_ml/models/isolation_forest.pkl")
print("✅ Model trained and saved at models/isolation_forest.pkl")
