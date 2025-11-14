# Vercel Environment Variables Setup

## Required Configuration

After deploying to Vercel, you need to set up environment variables for the frontend to connect to your backend.

### Steps:

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click on **Settings** tab
   - Select **Environment Variables** from the sidebar

2. **Add the following environment variable:**

   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_API_URL` | Your backend API URL | Production, Preview, Development |

### Backend URL Options:

#### Option 1: Render Deployment (Recommended)
If you deployed the backend to Render:
```
VITE_API_URL=https://your-app-name.onrender.com
```

#### Option 2: Local Development Backend
For testing with local backend:
```
VITE_API_URL=http://localhost:3000
```

#### Option 3: Other Cloud Provider
If deployed elsewhere:
```
VITE_API_URL=https://your-backend-domain.com
```

### Important Notes:

1. **No trailing slash** - Don't add `/` at the end of the URL
2. **HTTPS required** - Production should use HTTPS
3. **CORS Configuration** - Make sure your backend allows requests from your Vercel domain

### Verify Configuration:

After setting the environment variable:
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Select "Use existing Build Cache" (optional)
4. Click **Redeploy**

### Backend CORS Setup:

Make sure your backend's `FRONTEND_URL` environment variable includes your Vercel domain:

```env
FRONTEND_URL=https://your-app.vercel.app
```

Or allow multiple origins:
```env
FRONTEND_URL=https://your-app.vercel.app,https://another-domain.com
```

## Demo Login Credentials

Once the backend is connected, users can use these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Farmer | farmer@demo.com | Demo@123 |
| FPO Admin | fpo@demo.com | Demo@123 |
| Market Maker | market@demo.com | Demo@123 |
| Admin | admin@demo.com | Demo@123 |

## Troubleshooting

### "Login failed" error
- **Cause**: Backend URL not configured or unreachable
- **Solution**: Set `VITE_API_URL` in Vercel environment variables and redeploy

### CORS errors in browser console
- **Cause**: Backend not allowing requests from Vercel domain
- **Solution**: Update backend's `FRONTEND_URL` environment variable

### 404 errors
- **Cause**: Wrong backend URL
- **Solution**: Verify the backend URL is correct and accessible

### Connection timeout
- **Cause**: Backend server not running or sleeping (Render free tier)
- **Solution**: Wake up the backend by visiting its URL directly first
