import pandas as pd
from geopy.distance import geodesic

def preprocess_scan_logs(filepath):
    df = pd.read_csv(filepath, parse_dates=['timestamp'])
    df = df.sort_values(['batch_id', 'timestamp'])
    
    # Time since last scan for same batch
    df['prev_time'] = df.groupby('batch_id')['timestamp'].shift(1)
    df['scan_interval_hours'] = (df['timestamp'] - df['prev_time']).dt.total_seconds() / 3600
    df['scan_interval_hours'].fillna(df['scan_interval_hours'].max(), inplace=True)
    
    # Distance from previous scan
    def compute_distance(row):
        if pd.isna(row['prev_time']):
            return 0
        prev = df[(df['batch_id'] == row['batch_id']) & (df['timestamp'] == row['prev_time'])].iloc[0]
        return geodesic((row['lat'], row['lon']), (prev['lat'], prev['lon'])).km
    
    df['distance_km'] = df.apply(compute_distance, axis=1)
    
    # Retailer type: assume R1-R5 are registered
    registered_retailers = ["R1", "R2", "R3", "R4", "R5"]
    df['retailer_type'] = df['retailer_id'].apply(lambda x: 1 if x in registered_retailers else 0)
    
    return df[['lat', 'lon', 'scan_interval_hours', 'distance_km', 'retailer_type', 'batch_id']]
