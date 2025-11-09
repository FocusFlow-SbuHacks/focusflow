# FocusFlow User Guide

## 🚀 Quick Start - Running the Application

### Prerequisites
- Node.js installed
- Python installed
- MongoDB Atlas account (or local MongoDB)
- Auth0 account

### Step 1: Install Dependencies

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

### Step 2: Configure Environment Variables

**Backend** - Create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/focusflow?retryWrites=true&w=majority
PORT=3000
FRONTEND_URL=http://localhost:8080
ML_SERVICE_URL=http://localhost:5000
OPENROUTER_API_KEY=your_key_here (optional)
ELEVENLABS_API_KEY=your_key_here (optional)
```

**Frontend** - Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH0_DOMAIN=dev-dpqkca4rwoqa3qlp.us.auth0.com
VITE_AUTH0_CLIENT_ID=HJJiMaA5REw1kBVzH0T1FfEY5AUnnMxA
VITE_AUTH0_REDIRECT_URI=http://localhost:8080
```

### Step 3: Start All Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:3000`

**Terminal 2 - ML Service:**
```bash
cd ml
python app.py
```
ML service runs on `http://localhost:5000`

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:8080`

### Step 4: Open in Browser
Navigate to: `http://localhost:8080`

---

## 📱 How to Use FocusFlow

### 1. **Login/Sign Up**

1. Open `http://localhost:8080` in your browser
2. You'll be redirected to the login page
3. Choose one of two options:
   - **"Login / Sign up"** - Use email/password (Auth0)
   - **"Login with Google"** - Use your Google account
4. After authentication, you'll be taken to the dashboard

### 2. **Dashboard Overview**

The dashboard shows:
- **Focus Gauge** (center) - Your current focus score (0-100)
- **Session Controls** - Start/Pause/End buttons
- **Today's Overview** - Stats cards showing:
  - Average Focus %
  - Best Hour of the day
  - Number of sessions today
- **Focus History Chart** - 7-day trend
- **AI Motivation** - Personalized messages

### 3. **Starting a Focus Session**

1. Click **"Start Focus Session"** button
2. You'll be taken to the Focus Session page
3. A 25-minute Pomodoro timer starts automatically
4. Focus tracking begins immediately:
   - The app monitors your typing speed
   - Tracks idle time (inactivity)
   - Detects tab switches

### 4. **During a Focus Session**

**What You'll See:**
- **Pomodoro Timer** - Countdown from 25:00
- **Live Focus Score** - Updates every 5 seconds
- **Focus Status** - Shows "Focused", "Losing Focus", or "Distracted"
- **AI Feedback** - Messages appear when focus drops
- **Voice Feedback** - Audio plays automatically if focus gets very low

**Focus Score Colors:**
- 🟢 **Green (80-100)**: Excellent focus!
- 🔵 **Blue (60-79)**: Good focus
- 🟠 **Orange (40-59)**: Focus dropping
- 🔴 **Red (0-39)**: Very distracted

**Controls:**
- **Pause** - Pause the timer and tracking
- **Resume** - Continue the session
- **End Session** - Manually end before timer finishes

### 5. **How Focus Tracking Works**

The app tracks three metrics:

1. **Typing Speed** 📝
   - Measures how many keys you press per minute
   - Higher = better focus (you're actively working)

2. **Idle Time** ⏸️
   - Tracks seconds of inactivity
   - Lower = better focus (you're engaged)

3. **Tab Switches** 🔄
   - Counts when you switch away from the page
   - Lower = better focus (you're staying on task)

**Every 5 seconds:**
- Metrics are sent to the backend
- ML model calculates your focus score
- If focus drops, AI generates a message
- If very low, voice feedback plays

### 6. **AI Messages**

When your focus score drops below 60:
- An AI-generated message appears
- Messages are personalized based on your current state
- Examples:
  - "Your focus is dropping slightly. Take a deep breath and refocus."
  - "Looks like you're getting tired. Take a 3-minute walk!"

**To hear the message:**
- Click the **"Play Voice"** button in the AI Feedback card
- Or wait for automatic voice feedback (if focus < 40)

### 7. **Ending a Session**

**Automatic:**
- When the 25-minute timer reaches 0:00
- Session automatically ends
- You're redirected to the dashboard
- A summary shows your session score

**Manual:**
- Click **"End Session"** button anytime
- Session ends immediately
- Stats are calculated and saved

### 8. **Viewing Your Progress**

**Dashboard Analytics:**
- **Focus History Chart** - See your focus trends over 7 days
- **Average Focus** - Your overall focus percentage
- **Best Hour** - When you're most focused during the day
- **Session Count** - How many sessions you've completed

**Session Summary:**
- After each session, see:
  - Average focus score
  - Maximum focus achieved
  - Minimum focus (lowest point)
  - Total session duration

---

## 🎯 Tips for Best Results

### ✅ Do:
- **Keep the tab active** - Don't minimize or switch away
- **Type naturally** - The app tracks your activity
- **Stay engaged** - Active typing = higher focus score
- **Take breaks** - When focus drops, the AI will remind you
- **Review your analytics** - Learn your best study hours

### ❌ Don't:
- **Don't leave the page** - Tab switches lower your score
- **Don't stay idle** - Long inactivity reduces focus score
- **Don't ignore the feedback** - AI messages help you refocus

---

## 🔧 Troubleshooting

### "Can't log in"
- Check Auth0 callback URLs are set to `http://localhost:8080`
- Clear browser cache and try again
- Make sure backend is running

### "Focus score not updating"
- Make sure ML service is running on port 5000
- Check browser console for errors
- Verify backend is connected to MongoDB

### "No voice feedback"
- ElevenLabs API key is optional
- Voice only plays when focus < 40
- Check that audio isn't muted in browser

### "Session not saving"
- Verify MongoDB connection
- Check backend logs for errors
- Ensure backend is running

---

## 📊 Understanding Your Data

### Focus Score Breakdown:
- **90-100**: Exceptional focus - you're in the zone!
- **80-89**: Great focus - keep it up
- **70-79**: Good focus - minor distractions
- **60-69**: Focus dropping - time to refocus
- **50-59**: Losing focus - take a short break
- **Below 50**: Very distracted - take a longer break

### Best Practices:
1. **Study during your best hours** - Check analytics to find them
2. **Take breaks when focus drops** - Listen to AI suggestions
3. **Track patterns** - Review weekly trends
4. **Set goals** - Aim to improve average focus over time

---

## 🎓 Example Study Session

1. **9:00 AM** - Login to FocusFlow
2. **9:05 AM** - Start a focus session
3. **9:10 AM** - Focus score: 85 (Green) - "You're doing great!"
4. **9:20 AM** - Focus score: 65 (Blue) - AI: "Take a deep breath"
5. **9:25 AM** - Focus score: 45 (Orange) - Voice: "Take a 3-minute walk"
6. **9:30 AM** - Timer ends, session complete
7. **9:31 AM** - View summary: Average 68, Best 90
8. **9:35 AM** - Start another session

---

## 🔐 Account Management

### Profile:
- View your profile at `/profile`
- See total sessions completed
- Check total focus time accumulated

### Logout:
- Click "Logout" in the navigation bar
- You'll be redirected to login page
- Your data is saved in MongoDB

---

## 💡 Advanced Features

### API Keys (Optional):
- **OpenRouter**: Enables AI-generated messages (fallback messages work without it)
- **ElevenLabs**: Enables voice feedback (works without it, just no audio)

### Customization:
- Timer duration: Currently 25 minutes (Pomodoro)
- Tracking interval: Every 5 seconds
- Focus thresholds: Configurable in backend

---

## 📞 Need Help?

- Check `HOW_IT_WORKS.md` for technical details
- See `SETUP.md` for installation help
- Review `README.md` for overview
- Check browser console for errors
- Check backend terminal for server logs

---

## 🎉 You're Ready!

Start your first focus session and see how FocusFlow helps you stay productive! Remember:
- Keep the tab active
- Stay engaged
- Listen to AI feedback
- Review your progress

Happy focusing! 🚀

