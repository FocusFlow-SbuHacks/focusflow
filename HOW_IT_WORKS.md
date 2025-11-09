# How FocusFlow Works - Complete System Overview

## 🏗️ Architecture Overview

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│  MongoDB    │
│  (React)    │      │  (Express)  │      │   Atlas     │
│  Port 8080  │      │  Port 3000  │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌─────────────┐      ┌─────────────┐
│   Auth0     │      │  ML Service │
│ (Auth)      │      │  (Flask)    │
│             │      │  Port 5000  │
└─────────────┘      └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │ OpenRouter  │
                    │ ElevenLabs  │
                    └─────────────┘
```

## 🔐 1. Authentication Flow

### Step-by-Step:
1. **User visits** `http://localhost:8080/login`
2. **Clicks "Login"** or **"Login with Google"**
3. **Auth0 handles authentication:**
   - Redirects to Auth0 login page
   - User enters credentials (or uses Google OAuth)
   - Auth0 validates and returns JWT token
4. **Frontend receives token** and stores it
5. **User is redirected** to dashboard (`/`)
6. **Frontend creates/gets user** in MongoDB:
   - Calls `POST /api/auth/user` with Auth0 user info
   - Backend creates User document if new, or returns existing
   - User data stored: `auth0Id`, `email`, `name`, `picture`

### Protected Routes:
- All routes except `/login` are protected
- `ProtectedRoute` component checks authentication
- Unauthenticated users → redirected to `/login`

---

## 📊 2. Dashboard (Index Page)

### What Happens on Load:

1. **User Initialization:**
   ```typescript
   - Get Auth0 user info
   - Create/get user in MongoDB
   - Store user ID for API calls
   ```

2. **Check for Active Session:**
   ```typescript
   - GET /api/sessions/active/:userId
   - Returns null if no active session (200 OK)
   - If session exists → show "active" or "paused" status
   ```

3. **Load Analytics:**
   ```typescript
   - GET /api/focus/analytics/:userId?days=7
   - Calculates: average focus score, best hour, daily trends
   - Displays on dashboard cards
   ```

4. **Load Session History:**
   ```typescript
   - GET /api/sessions/history/:userId?limit=100
   - Counts today's sessions
   - Shows in stats card
   ```

### Dashboard Features:
- **Focus Gauge**: Shows current focus score (75 default)
- **Session Controls**: Start/Pause/End session buttons
- **Analytics Chart**: 7-day focus history
- **Stat Cards**: Avg focus, best hour, session count
- **AI Motivation**: Displays motivational messages

---

## 🎯 3. Starting a Focus Session

### When User Clicks "Start Focus Session":

1. **Navigate to** `/focus-session`
2. **Create Session:**
   ```typescript
   - Check for existing active session
   - If none: POST /api/sessions/create
   - Backend creates FocusSession document
   - Status: "active"
   ```

3. **Initialize Tracking:**
   ```typescript
   - Start Pomodoro timer (25 minutes)
   - Activate focus tracking hook
   - Begin monitoring user behavior
   ```

---

## 📈 4. Real-Time Focus Tracking

### How It Works:

#### **Tracking Metrics (Every 5 seconds):**

1. **Typing Speed:**
   ```typescript
   - Listens to keydown, mousedown, mousemove, scroll events
   - Counts key presses
   - Calculates keys per minute every 10 seconds
   - Higher = better focus
   ```

2. **Idle Time:**
   ```typescript
   - Tracks time since last activity
   - Resets on any user interaction
   - Measured in seconds
   - Higher = worse focus
   ```

3. **Tab Switches:**
   ```typescript
   - Monitors page visibility changes
   - Counts when user switches away (>2 seconds)
   - Higher = worse focus
   ```

#### **Data Flow:**

```
Frontend Hook → Every 5 seconds → POST /api/focus/track
```

**Backend Processing:**

1. **Send to ML Service:**
   ```javascript
   POST http://localhost:5000/predict
   {
     typing_speed: 45,
     idle_time: 5,
     tab_switches: 2
   }
   ```

2. **ML Model Predicts:**
   ```python
   - Uses heuristic-based model
   - Considers: typing speed (+), idle time (-), tab switches (-)
   - Returns: focus_score (0-100), focus_label ("Focused"/"Losing Focus"/"Distracted")
   ```

3. **Generate AI Message (if focus < 60):**
   ```javascript
   - If OpenRouter API key set:
     → Call OpenRouter API
     → Get personalized message from GPT-3.5
   - Else: Use fallback messages
   ```

4. **Generate Voice (if focus < 40):**
   ```javascript
   - If ElevenLabs API key set:
     → Convert AI message to speech
     → Return base64 audio data URL
   - Frontend auto-plays audio
   ```

5. **Save to Database:**
   ```javascript
   - Create FocusData document
   - Update FocusSession with new data point
   - Return to frontend: { focusScore, focusLabel, aiMessage, voiceUrl }
   ```

6. **Frontend Updates:**
   ```typescript
   - Updates FocusGauge with new score
   - Displays AI message in AIMotivation component
   - Auto-plays voice if available
   - Color changes: Green (80+), Blue (60-79), Orange (40-59), Red (<40)
   ```

---

## ⏱️ 5. Pomodoro Timer

### Timer Logic:

```typescript
- Starts at 25 minutes (1500 seconds)
- Counts down every second
- When reaches 0:
  → Automatically ends session
  → POST /api/sessions/:sessionId/end
  → Navigate back to dashboard with score
```

### Session States:
- **Active**: Timer running, tracking active
- **Paused**: Timer stopped, tracking paused
- **Completed**: Session ended, stats calculated

---

## 💾 6. Data Storage

### MongoDB Collections:

#### **Users:**
```javascript
{
  auth0Id: "auth0|...",
  email: "user@example.com",
  name: "John Doe",
  picture: "https://...",
  totalSessions: 5,
  totalFocusTime: 120, // minutes
  createdAt: Date,
  lastActive: Date
}
```

#### **FocusSessions:**
```javascript
{
  userId: ObjectId,
  startTime: Date,
  endTime: Date,
  duration: 1500, // seconds
  status: "active" | "completed" | "paused",
  averageFocusScore: 75,
  maxFocusScore: 95,
  minFocusScore: 45,
  focusDataPoints: [
    {
      timestamp: Date,
      typingSpeed: 45,
      idleTime: 5,
      tabSwitches: 2,
      focusScore: 78,
      aiMessage: "...",
      voiceUrl: "data:audio/mpeg;base64,..."
    }
  ]
}
```

#### **FocusData:**
```javascript
{
  userId: ObjectId,
  sessionId: ObjectId,
  timestamp: Date,
  typingSpeed: 45,
  idleTime: 5,
  tabSwitches: 2,
  focusScore: 78,
  focusLabel: "Focused",
  aiMessage: "...",
  voiceUrl: "..."
}
```

---

## 🔄 7. Complete User Flow Example

### Scenario: User Studies for 25 Minutes

1. **Login** → Auth0 → Dashboard loads
2. **Click "Start Focus Session"** → Session created in DB
3. **Tracking Begins:**
   - Every 5 seconds: metrics sent to backend
   - Backend → ML Service → Gets focus score
   - If score drops → AI message generated
   - If very low → Voice feedback plays
4. **User sees:**
   - Live focus score updating
   - Color changes on gauge
   - AI messages appearing
   - Voice feedback playing (if enabled)
5. **Timer reaches 0:**
   - Session auto-ends
   - Stats calculated (avg, max, min scores)
   - Redirected to dashboard
   - Session summary shown
6. **Dashboard Updates:**
   - New session in history
   - Analytics updated
   - Stats refreshed

---

## 🎨 8. UI Components

### **FocusGauge:**
- Circular progress indicator
- Color-coded: Green → Blue → Orange → Red
- Shows score (0-100) and status

### **AIMotivation:**
- Displays AI-generated messages
- "Play Voice" button for voice feedback
- Updates when focus drops

### **PomodoroTimer:**
- Countdown display (MM:SS)
- Pause/Resume controls
- End session button

### **AnalyticsChart:**
- Line chart showing focus over time
- Uses Recharts library
- Groups data by day

---

## 🔧 9. API Endpoints Summary

### Auth:
- `POST /api/auth/user` - Create/get user
- `GET /api/auth/user/:auth0Id` - Get user profile

### Focus Tracking:
- `POST /api/focus/track` - Submit focus metrics → Returns score + AI message
- `GET /api/focus/history/:userId` - Get focus history
- `GET /api/focus/analytics/:userId` - Get analytics (avg, best hour, trends)

### Sessions:
- `POST /api/sessions/create` - Create new session
- `GET /api/sessions/active/:userId` - Get active session (returns null if none)
- `PATCH /api/sessions/:sessionId` - Update session
- `POST /api/sessions/:sessionId/end` - End session
- `GET /api/sessions/history/:userId` - Get session history

---

## 🚀 10. Key Features

### ✅ Implemented:
- Auth0 authentication (Email + Google)
- Real-time focus tracking (typing, idle, tab switches)
- ML-based focus prediction
- AI messages via OpenRouter (with fallback)
- Voice feedback via ElevenLabs (optional)
- Session management (Pomodoro timer)
- Analytics and history
- MongoDB data persistence

### 🔄 Real-Time Updates:
- Focus score updates every 5 seconds
- Timer counts down every second
- Session duration updates every 10 seconds
- UI reflects changes immediately

### 🎯 Smart Features:
- Auto-detects focus drops
- Generates contextual AI messages
- Plays voice feedback when focus is very low
- Tracks patterns over time
- Calculates best study hours

---

## 📝 Notes

- **No Active Session = Normal**: Returns `200 OK` with `null` (not an error)
- **ML Service Fallback**: If ML service is down, uses simple heuristic
- **API Keys Optional**: Works without OpenRouter/ElevenLabs (uses fallbacks)
- **Error Handling**: Non-critical failures don't break the app
- **Data Persistence**: All data saved to MongoDB Atlas

This is a complete, production-ready focus tracking system! 🎉

