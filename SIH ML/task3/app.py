from fastapi import FastAPI
import joblib
import pandas as pd

# Load model + scaler
model = joblib.load("quality_model.pkl")
scaler = joblib.load("scaler.pkl")

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Quality Test Prediction API is running 🚀"}

@app.post("/predict/")
def predict(
    temperature: float,
    humidity: float,
    soil_nitrogen: float,
    rainfall: float,
    region: int,
    harvest_month: int
):
    # Make dataframe from input
    features = pd.DataFrame([{
        "temperature": temperature,
        "humidity": humidity,
        "soil_nitrogen": soil_nitrogen,
        "rainfall": rainfall,
        "region": region,
        "harvest_month": harvest_month
    }])
    
    # Scale features
    scaled = scaler.transform(features)
    
    # Predict
    prediction = model.predict(scaled)[0]
    
    return {"prediction": int(prediction), "meaning": "Pass ✅" if prediction==1 else "Fail ❌"}
