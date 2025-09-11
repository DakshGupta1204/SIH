import os
import sys
import joblib
import pandas as pd

# Ensure src/ is discoverable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.utils import load_harvest_data, load_herb_rules
from src.anomaly_detection import detect_weekly_anomalies
from src.evaluate import evaluate_model

HARVEST_FILE = "../harvest_anomaly_detection/data/new_data.csv"   # new incoming harvest logs
RULES_FILE = "../harvest_anomaly_detection/data/herb_rules_dataset.csv"
MODEL_FILE = "../harvest_anomaly_detection/models/isolation_forest.joblib"
OUTPUT_FILE = "../harvest_anomaly_detection/data/detected_anomalies.csv"


def main():
    print("🔹 Loading data...")
    df_harvest = load_harvest_data(HARVEST_FILE)
    df_rules = load_herb_rules(RULES_FILE)

    print("🔹 Loading trained Isolation Forest model...")
    iso_forest = joblib.load(MODEL_FILE)

    print("🔹 Detecting anomalies (weekly)...")
    df_results = detect_weekly_anomalies(df_harvest, df_rules, iso_forest)

    print("🔹 Evaluating model vs rules...")
    evaluate_model(df_results)

if __name__ == "__main__":
    main()
