# SIH Frontend - Agricultural Supply Chain Traceability

A modern React TypeScript frontend for the SIH (Supply Chain Intelligence Hub) agricultural traceability platform.

## 🚀 Features

- **Role-based Authentication**: Farmer, Processor, Lab, Consumer dashboards
- **QR Code Verification**: Scan products to view complete provenance
- **Real-time Data**: Live updates from backend API
- **Responsive Design**: Works on desktop and mobile devices
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Built with Tailwind CSS and Shadcn/UI components

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form + Zod validation

## 🔧 Development Setup

1. **Clone and install dependencies**
   ```bash
   cd "SIH Frontend"
   npm install
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Visit: http://localhost:8080

## 🌐 API Configuration

The frontend connects to the backend API using environment variables:

- **Development**: `http://localhost:3000/api`
- **Production**: `https://sih-backend-0hgu.onrender.com/api`

## 🚀 Deployment on Vercel

### Quick Deploy
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Frontend ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Environment Variables**
   Set in Vercel dashboard:
   ```
   VITE_API_BASE_URL=https://sih-backend-0hgu.onrender.com/api
   ```

### Manual Configuration
The included `vercel.json` provides deployment configuration:
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

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

You can deploy AgriTrace to any static hosting provider (Vercel, Netlify, GitHub Pages) or your own server.

### Vercel (recommended)
- Import the repo on Vercel
- Set `VITE_API_BASE_URL` env var
- Build and deploy

### Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Env: `VITE_API_BASE_URL`

### Static hosting
- Run `npm run build`
- Serve the `dist/` folder with any static server
