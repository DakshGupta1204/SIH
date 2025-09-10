# 🚀 SIH Frontend - Vercel Deployment Guide

## ✅ **Pre-Deployment Checklist**
- [x] Backend deployed on Render: `https://sih-backend-0hgu.onrender.com`
- [x] Frontend configured with production API URL
- [x] Environment variables set up
- [x] Build testing completed
- [x] API connectivity verified

## 📋 **Vercel Deployment Steps**

### **Option 1: Automatic Deployment (Recommended)**

1. **Push to GitHub**
   ```bash
   cd "/Users/dakshgupta/Desktop/SIH"
   git add .
   git commit -m "Frontend configured for Vercel deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Visit: https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository: `SIH`
   - **Root Directory**: `SIH Frontend` (important!)
   - Vercel will auto-detect Vite framework

3. **Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   Name: VITE_API_BASE_URL
   Value: https://sih-backend-0hgu.onrender.com/api
   ```

### **Option 2: CLI Deployment**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd "/Users/dakshgupta/Desktop/SIH/SIH Frontend"
   vercel --prod
   ```

## 🔧 **Build Configuration**

### **Package.json Scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:prod": "VITE_API_BASE_URL=https://sih-backend-0hgu.onrender.com/api vite build",
    "preview": "vite preview"
  }
}
```

### **Vercel.json Configuration**
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_BASE_URL": "https://sih-backend-0hgu.onrender.com/api"
  }
}
```

## 🌐 **Environment Configuration**

### **Development (.env)**
```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

### **Production (Vercel)**
```bash
VITE_API_BASE_URL=https://sih-backend-0hgu.onrender.com/api
```

## ✅ **Verification Steps**

After deployment:

1. **Test Authentication**
   - Visit: `https://your-app.vercel.app/login`
   - Login with: `farmer@example.com / password123`

2. **Test API Connection**
   - Check browser network tab for API calls
   - Verify calls go to: `https://sih-backend-0hgu.onrender.com/api`

3. **Test QR Verification**
   - Visit: `https://your-app.vercel.app/verify/BATCH-RICE-001`
   - Should show complete product provenance

## 🎯 **Expected URLs**

- **Frontend**: `https://your-project-name.vercel.app`
- **Backend**: `https://sih-backend-0hgu.onrender.com`
- **API Docs**: `https://sih-backend-0hgu.onrender.com/api-docs`

## 🔧 **Troubleshooting**

### **Common Issues**

1. **CORS Errors**
   - Ensure backend allows your Vercel domain
   - Check CORS settings in backend

2. **API Connection Failed**
   - Verify `VITE_API_BASE_URL` environment variable
   - Check backend is running on Render

3. **Build Failures**
   - Run `npm run build` locally first
   - Check TypeScript errors
   - Verify all dependencies are in package.json

### **Debug Commands**
```bash
# Test local build
npm run build

# Test with production API
VITE_API_BASE_URL=https://sih-backend-0hgu.onrender.com/api npm run dev

# Preview production build
npm run preview
```

## 🚀 **Ready for Deployment!**

Your frontend is fully configured and ready for Vercel deployment with:
- ✅ Production API URL configured
- ✅ Build optimization completed
- ✅ Environment variables set
- ✅ Vercel configuration ready
- ✅ Full functionality tested

Deploy now and your agricultural traceability platform will be live! 🌾
