# Render Deployment Guide for FocusFlow

This guide will help you deploy FocusFlow on Render. Render is a Platform-as-a-Service (PaaS) that makes deployment much easier than traditional VPS hosting.

## Prerequisites

- A Render account ([sign up here](https://render.com) - free tier available)
- A GitHub account (for automatic deployments)
- MongoDB Atlas account (or use Render's MongoDB)
- Your code pushed to a GitHub repository

---

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Step 2: Create MongoDB Database

### Option A: MongoDB Atlas (Recommended - Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 - Free Forever)
3. Create a database user
4. Whitelist IP addresses (or use `0.0.0.0/0` for Render)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/focusflow`

### Option B: Render MongoDB (Paid)

1. In Render dashboard, click **"New +"**
2. Select **"MongoDB"**
3. Choose a name and region
4. Click **"Create Database"**
5. Copy the connection string from the dashboard

---

## Step 3: Deploy Backend Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository and branch
5. Configure the service:

   **Name**: `focusflow-backend` (or any name)
   
   **Region**: Choose closest to your users
   
   **Branch**: `main` (or your default branch)
   
   **Root Directory**: `backend`
   
   **Environment**: `Node`
   
   **Build Command**: `npm install`
   
   **Start Command**: `npm start`
   
   **Plan**: Free (or choose paid for better performance)

6. Click **"Advanced"** and add environment variables:

   ```env
   # Server
   PORT=10000
   NODE_ENV=production
   
   # MongoDB
   MONGODB_URI=your-mongodb-connection-string
   
   # ML Service (we'll set this after deploying ML service)
   ML_SERVICE_URL=https://focusflow-ml.onrender.com
   
   # Auth0
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_BASE_URL=https://focusflow-backend.onrender.com
   AUTH0_SECRET=generate-a-random-secret-key
   
   # Email (Resend recommended)
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_your_api_key
   EMAIL_FROM=onboarding@resend.dev
   FRONTEND_URL=https://focusflow.onrender.com
   
   # Optional APIs
   OPENROUTER_API_KEY=your-key
   ELEVENLABS_API_KEY=your-key
   ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
   ```

7. Click **"Create Web Service"**

8. Note the service URL (e.g., `https://focusflow-backend.onrender.com`)

---

## Step 4: Deploy ML Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect the same GitHub repository
3. Configure the service:

   **Name**: `focusflow-ml`
   
   **Region**: Same as backend
   
   **Branch**: `main`
   
   **Root Directory**: `ml`
   
   **Environment**: `Python 3**
   
   **Build Command**: `pip install -r requirements.txt`
   
   **Start Command**: `python app.py`
   
   **Plan**: Free

4. Click **"Advanced"** and add environment variables:

   ```env
   PORT=10000
   ```

5. Click **"Create Web Service"**

6. Note the service URL (e.g., `https://focusflow-ml.onrender.com`)

7. **Important**: Update the backend's `ML_SERVICE_URL` environment variable to this URL

---

## Step 5: Deploy Frontend (Static Site)

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure the site:

   **Name**: `focusflow` (or any name)
   
   **Branch**: `main`
   
   **Root Directory**: `frontend`
   
   **Build Command**: `npm install && npm run build`
   
   **Publish Directory**: `dist`

4. Click **"Advanced"** and add environment variables:

   ```env
   VITE_API_URL=https://focusflow-backend.onrender.com/api
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   VITE_AUTH0_AUDIENCE=your-api-identifier
   ```

5. Click **"Create Static Site"**

6. Note the site URL (e.g., `https://focusflow.onrender.com`)

---

## Step 6: Update Auth0 Settings

1. Go to your [Auth0 Dashboard](https://manage.auth0.com)
2. Go to **Applications** → Your Application
3. Update **Allowed Callback URLs**:
   ```
   https://focusflow.onrender.com/callback
   http://localhost:5173/callback
   ```
4. Update **Allowed Logout URLs**:
   ```
   https://focusflow.onrender.com
   http://localhost:5173
   ```
5. Update **Allowed Web Origins**:
   ```
   https://focusflow.onrender.com
   ```
6. Update **Application URIs**:
   - **Allowed Origins (CORS)**: `https://focusflow.onrender.com`

---

## Step 7: Update Environment Variables

After all services are deployed, update the environment variables:

### Backend Service
- Update `FRONTEND_URL` to your frontend URL
- Update `ML_SERVICE_URL` to your ML service URL
- Update `AUTH0_BASE_URL` to your backend URL

### Frontend Service
- Update `VITE_API_URL` to your backend API URL

---

## Step 8: Custom Domain (Optional)

1. In your frontend static site settings, click **"Custom Domains"**
2. Add your domain (e.g., `focusflow.com`)
3. Follow Render's instructions to add DNS records:
   - Add a **CNAME** record pointing to your Render site
4. Render will automatically provision SSL certificates

---

## Step 9: Prevent Free Tier Spin-Down

Render's free tier spins down after 15 minutes of inactivity. To prevent this:

### Option 1: Use a Cron Job (External)

Use a service like [cron-job.org](https://cron-job.org) to ping your services every 14 minutes:

- Backend: `https://focusflow-backend.onrender.com/api/health` (create this endpoint)
- ML Service: `https://focusflow-ml.onrender.com/health`

### Option 2: Upgrade to Paid Plan

Paid plans ($7/month per service) don't spin down.

### Option 3: Add Health Check Endpoints

Add these endpoints to keep services alive:

**Backend** (`backend/routes/health.js`):
```javascript
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
```

Then add to `backend/server.js`:
```javascript
app.use('/api/health', require('./routes/health'));
```

---

## Step 10: Verify Deployment

1. Visit your frontend URL: `https://focusflow.onrender.com`
2. Test login/signup
3. Start a focus session
4. Check that focus tracking works
5. Verify email notifications (if configured)

---

## Render-Specific Considerations

### Free Tier Limitations

- **Spin-down**: Services sleep after 15 minutes of inactivity
- **Build time**: 90 minutes per month
- **Bandwidth**: 100GB per month
- **Memory**: 512MB RAM

### Paid Tier Benefits

- No spin-down
- More resources
- Better performance
- Priority support

### Environment Variables

- All environment variables are encrypted
- Changes require a redeploy
- Use the Render dashboard to manage them

### Automatic Deployments

- Render automatically deploys on every push to your main branch
- You can disable auto-deploy in settings
- Manual deploys are available

---

## Troubleshooting

### Service Won't Start

1. Check **Logs** tab in Render dashboard
2. Verify environment variables are set correctly
3. Check build command and start command
4. Ensure root directory is correct

### CORS Errors

1. Update Auth0 allowed origins
2. Check backend CORS configuration
3. Verify frontend `VITE_API_URL` is correct

### MongoDB Connection Issues

1. Verify MongoDB connection string
2. Check IP whitelist (use `0.0.0.0/0` for Render)
3. Ensure database user has correct permissions

### ML Service Not Responding

1. Check ML service logs
2. Verify `ML_SERVICE_URL` in backend environment variables
3. Ensure ML service is deployed and running

### Frontend Build Fails

1. Check build logs
2. Verify all environment variables are set
3. Ensure `package.json` has correct build script
4. Check for TypeScript/ESLint errors

---

## Cost Estimation

### Free Tier
- **Backend**: Free (with limitations)
- **ML Service**: Free (with limitations)
- **Frontend**: Free
- **MongoDB Atlas**: Free (M0 tier)
- **Total**: $0/month

### Paid Tier (Recommended for Production)
- **Backend**: $7/month
- **ML Service**: $7/month
- **Frontend**: Free
- **MongoDB Atlas**: Free (or $9/month for M10)
- **Total**: ~$14-23/month

---

## Useful Commands

### View Logs
- Go to your service in Render dashboard
- Click **"Logs"** tab
- View real-time logs

### Manual Deploy
- Go to your service
- Click **"Manual Deploy"**
- Select branch and deploy

### Rollback
- Go to your service
- Click **"Events"** tab
- Find previous deployment
- Click **"Redeploy"**

---

## Best Practices

1. **Use Environment Variables**: Never commit secrets to Git
2. **Monitor Logs**: Regularly check service logs
3. **Set Up Alerts**: Configure email alerts for service failures
4. **Use Health Checks**: Add health endpoints to prevent spin-down
5. **Test Locally**: Always test changes locally before deploying
6. **Use Branches**: Deploy from a stable branch (main/master)
7. **Backup Database**: Regularly backup your MongoDB database

---

## Quick Reference

### Service URLs
- **Backend**: `https://focusflow-backend.onrender.com`
- **ML Service**: `https://focusflow-ml.onrender.com`
- **Frontend**: `https://focusflow.onrender.com`

### Environment Variables Checklist

**Backend**:
- ✅ `MONGODB_URI`
- ✅ `ML_SERVICE_URL`
- ✅ `AUTH0_*` variables
- ✅ `EMAIL_*` variables
- ✅ `FRONTEND_URL`

**ML Service**:
- ✅ `PORT`

**Frontend**:
- ✅ `VITE_API_URL`
- ✅ `VITE_AUTH0_*` variables

---

## Next Steps

1. ✅ Test all functionality
2. ✅ Set up custom domain (optional)
3. ✅ Configure health checks
4. ✅ Set up monitoring/alerts
5. ✅ Enable backups
6. ✅ Document your deployment

Your FocusFlow app should now be live on Render! 🚀

---

## Support

- [Render Documentation](https://render.com/docs)
- [Render Status](https://status.render.com)
- [Render Community](https://community.render.com)

