"""
Sample script to create and save ML models for the API
Run this to generate sample models that the API can load
"""

import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification, make_regression
import os

# Create models directory
os.makedirs('models', exist_ok=True)

print("🔨 Creating sample ML models...")

# 1. Classification Model
print("📊 Creating classification model...")
X_class, y_class = make_classification(n_samples=1000, n_features=10, n_classes=3, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X_class, y_class, test_size=0.2, random_state=42)

clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

with open('models/classification_model.pkl', 'wb') as f:
    pickle.dump(clf, f)
print(f"✅ Classification model saved with accuracy: {clf.score(X_test, y_test):.3f}")

# 2. Regression Model  
print("📈 Creating regression model...")
X_reg, y_reg = make_regression(n_samples=1000, n_features=8, noise=0.1, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X_reg, y_reg, test_size=0.2, random_state=42)

regr = RandomForestRegressor(n_estimators=100, random_state=42)
regr.fit(X_train, y_train)

with open('models/regression_model.pkl', 'wb') as f:
    pickle.dump(regr, f)
print(f"✅ Regression model saved with R² score: {regr.score(X_test, y_test):.3f}")

print("\n🎉 Sample models created successfully!")
print("📁 Models saved in 'models/' directory:")
print("   - classification_model.pkl")  
print("   - regression_model.pkl")
print("\n🚀 You can now start the API server with: python app.py")