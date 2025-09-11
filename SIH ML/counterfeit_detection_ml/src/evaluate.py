import os
import pandas as pd
import joblib
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
from preprocess import preprocess_scan_logs

# -------------------------------
# 1. Load Model
# -------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = "../counterfeit_detection_ml/models/isolation_forest.pkl"
DATA_PATH = "../counterfeit_detection_ml/data/scan_logs_sample.csv"

print(f"🔍 Loading model from {MODEL_PATH}")
model = joblib.load(MODEL_PATH)

# -------------------------------
# 2. Load & Preprocess Data
# -------------------------------
print(f"🔍 Loading data from {DATA_PATH}")
df_processed = preprocess_scan_logs(DATA_PATH)

X = df_processed[['lat', 'lon', 'scan_interval_hours', 'distance_km', 'retailer_type']]

# -------------------------------
# 3. Predict on Unseen Data
# -------------------------------
print("🚀 Running predictions on unseen data...")
y_pred = model.predict(X)   # -1 = anomaly, 1 = normal

# -------------------------------
# 4. Report Anomaly Ratio
# -------------------------------
anomaly_ratio = np.mean(y_pred == -1)
print(f"⚠️ Anomalies detected: {anomaly_ratio:.2%} of total scans")

# -------------------------------
# 5. Anomaly Score Distribution
# -------------------------------
scores = model.decision_function(X)  # higher = more normal
plt.hist(scores, bins=50, color="skyblue", edgecolor="black")
plt.xlabel("Anomaly Score")
plt.ylabel("Frequency")
plt.title("Anomaly Score Distribution on Unseen Data")
plt.show()

# -------------------------------
# 6. OPTIONAL: Rule-based Ground Truth
# -------------------------------
# Counterfeit rule: flag if distance > 500 km and interval < 6 hours
if {"distance_km", "scan_interval_hours"}.issubset(df_processed.columns):
    df_processed["label"] = (
        (df_processed["distance_km"] > 500) &
        (df_processed["scan_interval_hours"] < 6)
    ).astype(int)

    y_true = df_processed["label"].values
    y_pred_binary = np.array([1 if p == -1 else 0 for p in y_pred])  # 1=counterfeit, 0=normal

    print("\n📊 Rule-based Evaluation:")
    print(confusion_matrix(y_true, y_pred_binary))
    print(classification_report(y_true, y_pred_binary))
else:
    print("\n⚠️ Skipping rule-based evaluation (features missing).")
