import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from .rules import rule_based_anomalies_weekly

def detect_weekly_anomalies(df_harvest, herb_rules_df, iso_forest):
    """
    Detect weekly anomalies using both rule-based checks and Isolation Forest.
    Returns a DataFrame with:
    - weekly aggregated features
    - rule anomalies
    - Isolation Forest anomalies
    - final anomaly flag
    """

    # Add week/year columns
    df_harvest['week'] = df_harvest['timestamp'].dt.isocalendar().week
    df_harvest['year'] = df_harvest['timestamp'].dt.isocalendar().year

    # Weekly aggregation
    weekly_harvest = df_harvest.groupby(['farmer_id', 'plant_type', 'year', 'week']).agg({
        'quantity_harvested': 'sum',
        'region_id': 'first',
        'geo_lat': 'mean',
        'geo_lon': 'mean'
    }).reset_index()

    # Rule-based anomalies
    weekly_harvest['rule_anomalies'] = weekly_harvest.apply(
        lambda row: rule_based_anomalies_weekly(row, herb_rules_df), axis=1
    )

    # Features for Isolation Forest
    features = ['quantity_harvested', 'geo_lat', 'geo_lon']
    X = weekly_harvest[features].copy()
    X['quantity_harvested'] = np.log1p(X['quantity_harvested'])  # log scaling

    # Standard scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # ML-based anomalies using pre-trained Isolation Forest
    weekly_harvest['iforest_anomaly'] = iso_forest.predict(X_scaled)
    weekly_harvest['iforest_anomaly'] = weekly_harvest['iforest_anomaly'].map({1: 0, -1: 1})

    # Final anomaly flag: rule OR ML
    weekly_harvest['final_anomaly'] = weekly_harvest.apply(
        lambda row: 1 if (len(row['rule_anomalies']) > 0 or row['iforest_anomaly'] == 1) else 0, axis=1
    )

    return weekly_harvest
