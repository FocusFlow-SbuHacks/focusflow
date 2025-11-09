# FocusFlow Setup Guide

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

**ML Service:**
```bash
cd ml
pip install -r requirements.txt
```

### 2. Configure Environment Variables

**Backend** - Create `backend/.env`:
```env
# MongoDB Atlas connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/focusflow?retryWrites=true&w=majority
PORT=3000
FRONTEND_URL=http://localhost:8080
ML_SERVICE_URL=http://localhost:5000
OPENROUTER_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

**Frontend** - Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH0_DOMAIN=dev-dpqkca4rwoqa3qlp.us.auth0.com
VITE_AUTH0_CLIENT_ID=HJJiMaA5REw1kBVzH0T1FfEY5AUnnMxA
VITE_AUTH0_REDIRECT_URI=http://localhost:8080
```

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user (username/password)
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Click "Connect" → "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Replace `<database>` with `focusflow` (or your preferred database name)
9. Add the connection string to `backend/.env` as `MONGODB_URI`

**Example connection string:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/focusflow?retryWrites=true&w=majority
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - ML Service:**
```bash
cd ml
python app.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Access Application

Open `http://localhost:8080` in your browser.

## Auth0 Setup

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application (Single Page Application)
3. Add `http://localhost:8080` to Allowed Callback URLs
4. Add `http://localhost:8080` to Allowed Logout URLs
5. Copy Domain and Client ID to frontend `.env`

## API Keys (Optional but Recommended)

### OpenRouter
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Add to backend `.env` as `OPENROUTER_API_KEY`

### ElevenLabs
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Get your API key
3. Add to backend `.env` as `ELEVENLABS_API_KEY`
4. Optionally set a voice ID (default is provided)

## Troubleshooting

### MongoDB Atlas Connection Error
- Verify your MongoDB Atlas connection string in `backend/.env`
- Ensure your IP address is whitelisted in MongoDB Atlas Network Access
- Check that your database user password is correct
- Verify the cluster is running (not paused)
- Connection string format: `mongodb+srv://username:password@cluster.mongodb.net/focusflow?retryWrites=true&w=majority`

### Auth0 Login Not Working
- Check callback URLs in Auth0 dashboard
- Verify `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` in frontend `.env`

### ML Service Not Responding
- Ensure Python Flask service is running on port 5000
- Check `ML_SERVICE_URL` in backend `.env`

### CORS Errors
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check browser console for specific CORS errors

## Development Tips

- Backend auto-reloads with `nodemon` (npm run dev)
- Frontend hot-reloads with Vite
- ML service needs manual restart on code changes
- Check browser console and terminal logs for errors

