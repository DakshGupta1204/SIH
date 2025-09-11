# Counterfeit Detection via ML (India-specific)

## Setup
pip install -r requirements.txt

## Train Model
python src/train.py

## Detect Counterfeit
python src/detect.py

## Input Data
Place scan logs in data/ as CSV with columns:
batch_id, retailer_id, timestamp, lat, lon

## Output
Flags suspicious scan patterns (too far apart, unusual timing, unregistered retailer).
