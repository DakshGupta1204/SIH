import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from joblib import dump

from src.utils import load_harvest_data, load_herb_rules
from src.rules import rule_based_anomalies_weekly

# Paths
HARVEST_FILE = "../harvest_anomaly_detection/data/mock_harvest_dataset.csv"
RULES_FILE = "../harvest_anomaly_detection/data/herb_rules_dataset.csv"
MODEL_FILE = "../harvest_anomaly_detection/models/isolation_forest.joblib"

def main():
    print("🔹 Loading data...")
    df = load_harvest_data(HARVEST_FILE)
    df_rules = load_herb_rules(RULES_FILE)

    print("🔹 Aggregating weekly harvests...")
    df['week'] = df['timestamp'].dt.isocalendar().week
    df['year'] = df['timestamp'].dt.isocalendar().year

    weekly = df.groupby(['farmer_id','plant_type','year','week']).agg({
        'quantity_harvested': 'sum',
        'geo_lat': 'mean',
        'geo_lon': 'mean',
        'region_id': 'first'
    }).reset_index()

    # Rule anomalies for dynamic contamination
    weekly['rule_anomaly'] = weekly.apply(
        lambda row: 1 if len(rule_based_anomalies_weekly(row, df_rules)) > 0 else 0, axis=1
    )
    contamination = weekly['rule_anomaly'].mean() * 1.5  # slightly higher to increase recall
    contamination = min(contamination, 0.5)  
    print(f"👉 Rule anomaly fraction: {weekly['rule_anomaly'].mean():.3f}, using contamination={contamination:.3f}")

    # Features for Isolation Forest
    X = weekly[['quantity_harvested', 'geo_lat', 'geo_lon']].copy()
    X['quantity_harvested'] = np.log1p(X['quantity_harvested'])  # log scaling
    X_scaled = StandardScaler().fit_transform(X)

    # Train Isolation Forest
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=contamination,
        random_state=42
    )
    iso_forest.fit(X_scaled)

    # Save model
    os.makedirs(os.path.dirname(MODEL_FILE), exist_ok=True)
    dump(iso_forest, MODEL_FILE)
    print(f"✅ Model trained and saved at {MODEL_FILE}")

if __name__ == "__main__":
    main()
