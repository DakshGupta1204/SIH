# ML API Server

Flask-based REST API server for integrating Counterfeit Detection and Harvest Anomaly Detection ML models.

## Features

- **Counterfeit Detection API**: Detect suspicious scans using Isolation Forest
- **Harvest Anomaly Detection API**: Identify anomalous harvest patterns using hybrid ML + rule-based approach
- **Data Analysis Endpoints**: Get insights without running detection
- **CORS Support**: Frontend integration ready
- **File Upload Support**: CSV file uploads or JSON data
- **Error Handling**: Comprehensive error responses
- **Health Monitoring**: Status endpoint for monitoring

## Installation

1. Install dependencies:
```bash
pip install -r api_requirements.txt
```

2. Ensure model files exist:
   - `counterfeit_detection_ml/models/isolation_forest.pkl`
   - `harvest_anomaly_detection/models/isolation_forest.joblib`
   - `harvest_anomaly_detection/data/herb_rules_dataset.csv`

3. Run the server:
```bash
python ml_api_server.py
```

## API Endpoints

### Health Check
- **GET** `/` - Server health status

### Counterfeit Detection
- **POST** `/api/counterfeit/detect` - Detect suspicious scans
- **POST** `/api/counterfeit/analyze` - Analyze scan data

### Harvest Anomaly Detection  
- **POST** `/api/harvest/detect` - Detect harvest anomalies
- **POST** `/api/harvest/analyze` - Analyze harvest data

## Usage Examples

### Counterfeit Detection (JSON)
```json
POST /api/counterfeit/detect
{
  "scan_logs": [
    {
      "batch_id": "B001",
      "timestamp": "2024-01-15T10:30:00",
      "lat": 28.6139,
      "lon": 77.2090,
      "retailer_id": "R001"
    }
  ]
}
```

### Harvest Detection (JSON)
```json
POST /api/harvest/detect
{
  "harvest_logs": [
    {
      "farmer_id": "F001",
      "plant_type": "tomato",
      "timestamp": "2024-01-15T10:30:00",
      "quantity_harvested": 150.5,
      "region_id": "R001",
      "geo_lat": 28.6139,
      "geo_lon": 77.2090
    }
  ]
}
```

### File Upload
Both endpoints also accept CSV file uploads via multipart/form-data.

## Response Format

All endpoints return JSON responses with:
- `status`: "success" or "error"
- `data`: Response data (varies by endpoint)
- `error`: Error message (only on errors)

## Configuration

- **Port**: 5000 (configurable)
- **Max File Size**: 16MB
- **CORS**: Enabled for all origins
- **Debug Mode**: Enabled (disable for production)

## Production Deployment

For production:
1. Set `debug=False` in `app.run()`
2. Use a WSGI server like Gunicorn
3. Configure proper logging
4. Set up load balancing if needed
5. Secure CORS settings for specific domains
