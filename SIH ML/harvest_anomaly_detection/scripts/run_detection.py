import os
from joblib import load
from src.utils import load_harvest_data, load_herb_rules
from src.anomaly_detection import detect_weekly_anomalies

HARVEST_FILE = "../harvest_anomaly_detection/data/new_data.csv"   # new incoming harvest logs
RULES_FILE = "../harvest_anomaly_detection/data/herb_rules_dataset.csv"
MODEL_FILE = "../harvest_anomaly_detection/models/isolation_forest.joblib"
OUTPUT_FILE = "../harvest_anomaly_detection/data/detected_anomalies.csv"

def main():
    print("🔹 Loading new data...")
    df_harvest = load_harvest_data(HARVEST_FILE)
    herb_rules = load_herb_rules(RULES_FILE)

    print("🔹 Loading trained model...")
    iso_forest = load(MODEL_FILE)

    print("🔹 Running anomaly detection...")
    flagged = detect_weekly_anomalies(df_harvest, herb_rules, iso_forest)

    anomalies = flagged[flagged['final_anomaly'] == 1]
    anomalies.to_csv(OUTPUT_FILE, index=False)

    print(f"✅ Anomalies detected: {len(anomalies)}")
    print(f"📂 Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
