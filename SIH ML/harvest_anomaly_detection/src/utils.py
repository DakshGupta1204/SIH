import pandas as pd
import ast

def load_harvest_data(filepath):
    df = pd.read_csv(filepath)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    return df

def load_herb_rules(filepath):
    herb_rules = pd.read_csv(filepath)
    herb_rules['approved_regions'] = herb_rules['approved_regions'].apply(
        lambda x: set(ast.literal_eval(x)) if isinstance(x, str) else set(x)
    )
    return herb_rules
