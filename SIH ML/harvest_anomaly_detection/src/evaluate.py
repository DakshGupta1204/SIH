import pandas as pd
from sklearn.metrics import precision_score, recall_score, f1_score
import matplotlib.pyplot as plt

def evaluate_model(df_results: pd.DataFrame):
    """
    Evaluate Isolation Forest anomalies against Rule-based anomalies.
    Rule anomalies are treated as proxy ground truth.
    """

    # Convert list-based rule anomalies into binary flag
    df_results["rule_anomaly"] = df_results["rule_anomalies"].apply(lambda x: 1 if len(x) > 0 else 0)

    # Extract predictions & ground truth
    y_true = df_results["rule_anomaly"].astype(int)
    y_pred = df_results["iforest_anomaly"].astype(int)

    # Compute metrics
    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)

    print("\n📊 Evaluation Results (Isolation Forest vs Rules):")
    print(f"Precision: {precision:.3f}")
    print(f"Recall:    {recall:.3f}")
    print(f"F1 Score:  {f1:.3f}")

    # Visualization: harvest quantity with anomalies marked
    plt.figure(figsize=(10, 6))
    normal = df_results[df_results["iforest_anomaly"] == 0]
    anomalies = df_results[df_results["iforest_anomaly"] == 1]

    plt.scatter(normal.index, normal["quantity_harvested"], label="Normal", alpha=0.6)
    plt.scatter(anomalies.index, anomalies["quantity_harvested"], color="red", label="IForest Anomaly", alpha=0.8)

    plt.xlabel("Record Index")
    plt.ylabel("Weekly Quantity Harvested")
    plt.title("Harvest Anomalies (Isolation Forest vs Rules)")
    plt.legend()
    plt.show()

    return precision, recall, f1
