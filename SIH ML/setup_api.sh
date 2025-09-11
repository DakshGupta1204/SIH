#!/bin/bash

# ML API Server Setup Script
echo "🚀 Setting up ML API Server..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📥 Installing dependencies..."
pip install -r api_requirements.txt

echo "✅ Setup complete!"
echo ""
echo "🔧 To start the API server:"
echo "   source venv/bin/activate"
echo "   python ml_api_server.py"
echo ""
echo "🧪 To test the API:"
echo "   python test_api.py"
echo ""
echo "📋 Available endpoints:"
echo "   GET  http://localhost:5000/                        - Health check"
echo "   POST http://localhost:5000/api/counterfeit/detect  - Counterfeit detection"
echo "   POST http://localhost:5000/api/harvest/detect      - Harvest anomaly detection"
