# FocusFlow - AI-Powered Focus Tracking System

FocusFlow helps students stay focused and study efficiently using AI + real-time behavioral tracking. The system tracks, predicts, and reacts to focus drops.

## 🚀 Features

### Core Features (MUST HAVE)
- ✅ **Auth0 Authentication** - Login/Signup with Email + Google
- ✅ **Focus Tracking System** - Tracks typing speed, idle time, and tab switches
- ✅ **AI Focus Score Prediction** - ML model predicts focus score (0-100) and labels
- ✅ **Smart AI Messages** - OpenRouter API generates personalized messages when focus drops
- ✅ **Voice Feedback** - ElevenLabs API provides voice feedback for low focus

### Secondary Features
- 📊 Focus Session Timer (Pomodoro-style)
- 📈 Focus History & Analytics
- 🎯 Personalized Study Recommendations

## 🏗️ Architecture

```
FocusFlow/
├── frontend/          # React + TypeScript + Vite
├── backend/          # Node.js + Express + MongoDB
└── ml/               # Python Flask ML Service
```

## 📋 Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- MongoDB Atlas account (or local MongoDB)
- Auth0 Account
- OpenRouter API Key (optional)
- ElevenLabs API Key (optional)

## 🔧 Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string and API keys

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3000`

### 2. ML Service Setup

```bash
cd ml
pip install -r requirements.txt

# Start ML service
python app.py
```

ML service will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your Auth0 credentials

# Start frontend dev server
npm run dev
```

Frontend will run on `http://localhost:8080`

## 🔑 Environment Variables

### Backend (.env)
```env
# MongoDB Atlas connection string (get from MongoDB Atlas dashboard)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/focusflow?retryWrites=true&w=majority
PORT=3000
FRONTEND_URL=http://localhost:8080
ML_SERVICE_URL=http://localhost:5000
OPENROUTER_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_REDIRECT_URI=http://localhost:8080
```

## 🎯 API Endpoints

### Auth
- `POST /api/auth/user` - Create or get user
- `GET /api/auth/user/:auth0Id` - Get user profile

### Focus Tracking
- `POST /api/focus/track` - Submit focus metrics
- `GET /api/focus/history/:userId` - Get focus history
- `GET /api/focus/analytics/:userId` - Get focus analytics

### Sessions
- `POST /api/sessions/create` - Create new session
- `GET /api/sessions/active/:userId` - Get active session
- `PATCH /api/sessions/:sessionId` - Update session
- `POST /api/sessions/:sessionId/end` - End session
- `GET /api/sessions/history/:userId` - Get session history

## 🧠 ML Model

The ML service uses a simple heuristic-based model that considers:
- Typing speed (positive impact)
- Idle time (negative impact)
- Tab switches (negative impact)

The model returns:
- `focus_score`: 0-100
- `focus_label`: "Focused", "Losing Focus", or "Distracted"

## 🎨 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Auth0 React SDK
- Recharts

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- CORS

### ML Service
- Python
- Flask
- scikit-learn

## 📝 License

ISC

## 👥 Contributors

FocusFlow Team

