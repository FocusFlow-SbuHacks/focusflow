# Render Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Deploy with Blueprint (Easiest)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create all services
5. Fill in environment variables in the dashboard
6. Deploy!

### Step 3: Manual Deployment (Alternative)

#### Backend
1. **New +** → **Web Service**
2. Connect repo → Select `backend` as root directory
3. Build: `npm install`
4. Start: `npm start`
5. Add environment variables

#### ML Service
1. **New +** → **Web Service**
2. Connect repo → Select `ml` as root directory
3. Build: `pip install -r requirements.txt`
4. Start: `python app.py`
5. Add `PORT=10000`

#### Frontend
1. **New +** → **Static Site**
2. Connect repo → Select `frontend` as root directory
3. Build: `npm install && npm run build`
4. Publish: `dist`
5. Add environment variables

### Step 4: Environment Variables

**Backend** (Required):
```
MONGODB_URI=mongodb+srv://...
ML_SERVICE_URL=https://focusflow-ml.onrender.com
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_BASE_URL=https://focusflow-backend.onrender.com
FRONTEND_URL=https://focusflow.onrender.com
RESEND_API_KEY=re_...
EMAIL_FROM=onboarding@resend.dev
```

**Frontend** (Required):
```
VITE_API_URL=https://focusflow-backend.onrender.com/api
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
```

### Step 5: Update Auth0

Add to Auth0 Dashboard:
- **Callback URLs**: `https://focusflow.onrender.com/callback`
- **Logout URLs**: `https://focusflow.onrender.com`
- **Web Origins**: `https://focusflow.onrender.com`

### Step 6: Test

Visit: `https://focusflow.onrender.com` 🎉

---

## 💡 Pro Tips

1. **Free Tier Spin-Down**: Services sleep after 15 min. Use [cron-job.org](https://cron-job.org) to ping:
   - `https://focusflow-backend.onrender.com/api/health` (every 14 min)
   - `https://focusflow-ml.onrender.com/health` (every 14 min)

2. **Custom Domain**: Add in Static Site settings → Custom Domains

3. **View Logs**: Click service → Logs tab

4. **Redeploy**: Push to GitHub = auto-deploy (or Manual Deploy button)

---

## 📚 Full Guide

See `RENDER_DEPLOYMENT.md` for detailed instructions.

