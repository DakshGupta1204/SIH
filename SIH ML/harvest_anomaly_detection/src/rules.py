import pandas as pd

def rule_based_anomalies_weekly(row, herb_rules_df):
    anomalies = []
    
    herb_info = herb_rules_df[herb_rules_df['plant_type'] == row['plant_type']]
    if not herb_info.empty:
        max_qty = herb_info['max_quantity_per_week'].values[0]
        allowed_regions = herb_info['approved_regions'].values[0]
        
        if row['quantity_harvested'] > max_qty:
            anomalies.append(f'Over Quantity ({row["plant_type"]})')
        
        if row['region_id'] not in allowed_regions:
            anomalies.append(f'Outside Approved Region ({row["plant_type"]})')
    else:
        anomalies.append('Unknown Plant Type')
    
    return anomalies
