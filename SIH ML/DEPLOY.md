# SIH ML Deployment

## Deploy to Render

### Quick Deploy Steps:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to https://render.com
   - Connect your GitHub repository
   - Choose "Web Service"
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - Deploy!

### Environment Variables (if needed):
- `PYTHON_VERSION`: 3.9
- Add any API keys or database URLs in Render dashboard

### API Endpoints:
- `GET /` - API documentation
- `GET /health` - Health check
- `POST /predict` - Make ML predictions

### Test locally:
```bash
pip install -r requirements.txt
python app.py
```
Visit http://localhost:5000