# Troubleshooting Guide

## Focus Score Not Updating

### Check These:

1. **ML Service Running?**
   ```bash
   cd ml
   python app.py
   ```
   Should see: `Running on http://0.0.0.0:5000`

2. **Backend Connected to ML Service?**
   - Check `backend/.env`: `ML_SERVICE_URL=http://localhost:5000`
   - Check backend console for ML connection errors

3. **Browser Console:**
   - Open DevTools (F12)
   - Look for:
     - "Sending focus metrics:" - Should appear every 5 seconds
     - "Focus tracking result:" - Should show score updates
     - Any error messages

4. **Session Active?**
   - Make sure you're on the Focus Session page
   - Timer should be running
   - Check console for "Focus tracking skipped" messages

5. **Network Tab:**
   - Open DevTools → Network tab
   - Filter: "track"
   - Should see POST requests to `/api/focus/track` every 5 seconds
   - Check response status (should be 200)

### Debug Steps:

1. **Check if tracking is active:**
   - Start a focus session
   - Open browser console
   - You should see logs every 5 seconds

2. **Verify ML Service:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status": "ok"}`

3. **Test ML Prediction:**
   ```bash
   curl -X POST http://localhost:5000/predict \
     -H "Content-Type: application/json" \
     -d '{"typing_speed": 45, "idle_time": 5, "tab_switches": 2}'
   ```
   Should return focus score

---

## Profile Showing "John Doe"

### Fixed! ✅
- Profile now loads real user data from Auth0
- Shows your actual name, email, and picture
- Displays total sessions and focus time

**If still showing wrong data:**
- Clear browser cache
- Log out and log back in
- Check browser console for errors

---

## Logout Error

### Fixed! ✅
- Changed logout returnTo to `window.location.origin` (removed `/login`)

**If still having issues:**

1. **Check Auth0 Dashboard:**
   - Applications → Your App
   - Allowed Logout URLs should include: `http://localhost:8080`

2. **Clear Browser Storage:**
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   ```

3. **Try Incognito Mode:**
   - Test logout in private/incognito window
   - Rules out cache issues

---

## Common Issues

### "Cannot connect to backend"
- Make sure backend is running on port 3000
- Check `VITE_API_URL` in `frontend/.env`
- Verify CORS settings in backend

### "MongoDB connection error"
- Check `MONGODB_URI` in `backend/.env`
- Verify MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas

### "ML prediction error"
- ML service might be down
- Check `ML_SERVICE_URL` in backend `.env`
- Backend will use fallback heuristic if ML is down

### "Focus score stuck at 75"
- This is the default/initial score
- Wait 5 seconds for first update
- Check if tracking is active (console logs)
- Verify session is created in database

---

## Debug Checklist

When focus score isn't updating:

- [ ] ML service is running (`python app.py` in ml folder)
- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Frontend is running (`npm run dev` in frontend folder)
- [ ] Session is active (timer running)
- [ ] Browser console shows "Sending focus metrics" logs
- [ ] Network tab shows POST requests to `/api/focus/track`
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] No errors in ML service terminal

---

## Getting Help

If issues persist:

1. **Check all logs:**
   - Browser console (F12)
   - Backend terminal
   - ML service terminal

2. **Verify environment variables:**
   - Backend `.env` file
   - Frontend `.env` file

3. **Test endpoints manually:**
   ```bash
   # Test backend health
   curl http://localhost:3000/api/health
   
   # Test ML service
   curl http://localhost:5000/health
   ```

4. **Check database:**
   - Verify MongoDB connection
   - Check if data is being saved
   - Look for FocusData documents

---

## Quick Fixes

### Restart Everything:
```bash
# Stop all services (Ctrl+C)
# Then restart:
cd backend && npm run dev
cd ml && python app.py
cd frontend && npm run dev
```

### Clear Everything:
```bash
# Clear browser cache
# Clear localStorage
# Restart all services
```

### Check Dependencies:
```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install

# ML Service
cd ml && pip install -r requirements.txt
```

