#!/bin/bash

# 🚀 SIH ML API - Quick Deploy to Render
# This script helps you deploy your ML API service to Render

echo "🚀 SIH ML API - Render Deployment Helper"
echo "======================================="

# Check if we're in the right directory
if [[ ! -f "ml_api_server.py" ]]; then
    echo "❌ Error: ml_api_server.py not found"
    echo "💡 Please run this script from the 'SIH ML' directory"
    exit 1
fi

# Check if git is initialized
if [[ ! -d ".git" ]]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
else
    echo "✅ Git repository already initialized"
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy ML API service with frontend integration - $(date)"

echo ""
echo "🎯 Next Steps:"
echo "==============="
echo ""
echo "1. 📤 Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/sih-ml-api.git"
echo "   git push -u origin main"
echo ""
echo "2. 🌐 Deploy on Render:"
echo "   • Go to https://render.com"
echo "   • Click 'New +' → 'Web Service'"
echo "   • Connect your GitHub repository"
echo "   • Use these settings:"
echo "     - Build Command: pip install -r requirements.txt"
echo "     - Start Command: python ml_api_server.py"
echo "     - Environment: Python 3"
echo ""
echo "3. 🔗 Get your ML API URL:"
echo "   Your service will be available at:"
echo "   https://sih-ml-api-XXXX.onrender.com"
echo ""
echo "4. ⚙️  Update your backend .env:"
echo "   ML_API_URL=https://your-ml-api-url.onrender.com"
echo ""
echo "🧪 Test your deployed API:"
echo "   curl https://your-ml-api-url.onrender.com/"
echo ""
echo "📖 For detailed integration guide, see:"
echo "   📄 DEPLOY_RENDER.md"
echo "   📄 FRONTEND_INTEGRATION_GUIDE.md"
echo ""
echo "✅ Your ML service is ready for deployment!"
echo "⏱️  Deployment typically takes 3-5 minutes on Render"