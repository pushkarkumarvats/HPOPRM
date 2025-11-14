# Deploying Frontend to Vercel

This guide explains how to deploy the HPOPRM frontend to Vercel.

## Problem: Monorepo Workspace Conflicts

Since this is a monorepo with multiple workspaces (backend, frontend, contracts, worker, AI), Vercel might try to install all workspace dependencies by default, which can cause conflicts (e.g., ethers v5 vs v6 compatibility issues).

## Solution

We've configured Vercel to:
1. Only install and build the frontend workspace
2. Ignore other workspaces during the build process

## Configuration Files

### 1. `vercel.json` (Root)
```json
{
   "version": 2,
   "buildCommand": "cd frontend && npm install && npm run build",
   "outputDirectory": "frontend/dist",
   "installCommand": "cd frontend && npm install",
   "framework": null
}
```

**Note**: We removed `.vercelignore` as it was causing the frontend directory to be filtered out during the build process. The `vercel.json` configuration is sufficient to build only the frontend.

## Deployment Steps

### Option 1: Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`

3. **Environment Variables**
   Add these environment variables in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-api.onrender.com
   VITE_WS_URL=wss://your-backend-api.onrender.com
   VITE_BLOCKCHAIN_NETWORK=mumbai
   VITE_APP_NAME=Oilseed Hedging Platform
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend

### Option 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # From repository root
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_URL production
   vercel env add VITE_WS_URL production
   vercel env add VITE_BLOCKCHAIN_NETWORK production
   ```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://hedging-backend.onrender.com` |
| `VITE_WS_URL` | WebSocket URL | `wss://hedging-backend.onrender.com` |
| `VITE_BLOCKCHAIN_NETWORK` | Blockchain network | `mumbai` or `polygon` |
| `VITE_APP_NAME` | Application name | `Oilseed Hedging Platform` |

## Fixing the Ethers Dependency Conflict

If you encounter the ethers v5/v6 conflict error, the fix is already applied:

**Before (Conflicting):**
```json
"@nomiclabs/hardhat-ethers": "^2.2.3",  // Requires ethers v5
"ethers": "^6.9.2"                       // ethers v6 installed
```

**After (Fixed):**
```json
"@nomicfoundation/hardhat-ethers": "^3.0.5",  // Compatible with ethers v6
"ethers": "^6.9.2"
```

The updated `contracts/package.json` now uses the newer `@nomicfoundation/hardhat-ethers` v3 which is compatible with ethers v6.

## Vercel Build Output

Expected successful build output:
```
✓ Cloning completed
✓ Installing dependencies
✓ Building frontend
✓ Deployment ready
```

## Testing the Deployment

After deployment:

1. **Check Frontend**
   ```bash
   curl https://your-app.vercel.app
   # Should return HTML
   ```

2. **Test API Connection**
   - Open browser console on your Vercel deployment
   - Check if API calls work (you might see CORS errors if backend not configured)

3. **Configure Backend CORS**
   Add your Vercel domain to backend CORS whitelist in `backend/src/main.ts`:
   ```typescript
   app.enableCors({
     origin: [
       'http://localhost:5173',
       'https://your-app.vercel.app',  // Add this
     ],
   });
   ```

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

## Custom Domain

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Build Fails with Workspace Errors

**Solution**: Ensure `vercel.json` and `.vercelignore` are committed:
```bash
git add vercel.json .vercelignore
git commit -m "Add Vercel configuration"
git push
```

### Environment Variables Not Working

**Solution**: 
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add all `VITE_*` variables
3. Redeploy: `vercel --prod`

### API Calls Failing (CORS)

**Solution**: Update backend CORS to include your Vercel domain

### Build Command Not Found

**Solution**: Verify `frontend/package.json` has the build script:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

## Alternative: Deploy to Vercel with Monorepo

If you want to deploy other workspaces too:

1. Create separate Vercel projects for each service
2. Use `vercel.json` in each workspace directory
3. Set different root directories for each project

## Cost Considerations

- **Hobby Plan**: Free for personal projects
- **Pro Plan**: $20/month for teams
- **Bandwidth**: 100GB/month on Hobby
- **Build Minutes**: Unlimited on Hobby

## Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Deploy backend to Render (see `docs/DEPLOYMENT.md`)
3. ✅ Configure environment variables
4. ✅ Test end-to-end functionality
5. ✅ Set up custom domain (optional)

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Monorepo Deployment Guide](https://vercel.com/docs/concepts/monorepos)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Last Updated**: November 2025  
**Tested with**: Vercel CLI 48.9.2, Node.js 18+
