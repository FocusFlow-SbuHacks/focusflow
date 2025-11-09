const express = require('express');
const router = express.Router();
const FocusData = require('../models/FocusData');
const FocusSession = require('../models/FocusSession');
const User = require('../models/User');
const axios = require('axios');

// ML Service URL (Python Flask)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// OpenRouter API
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ElevenLabs API
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Predict focus score using ML model
async function predictFocusScore(typingSpeed, idleTime, tabSwitches) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
      typing_speed: typingSpeed,
      idle_time: idleTime,
      tab_switches: tabSwitches
    });
    return response.data;
  } catch (error) {
    console.error('ML prediction error:', error.message);
    // Fallback: simple heuristic
    let score = 100;
    if (idleTime > 30) score -= 20;
    if (tabSwitches > 5) score -= 15;
    if (typingSpeed < 10) score -= 10;
    return {
      focus_score: Math.max(0, Math.min(100, score)),
      focus_label: score >= 80 ? 'Focused' : score >= 50 ? 'Losing Focus' : 'Distracted'
    };
  }
}

// Generate AI message using OpenRouter
async function generateAIMessage(focusScore, focusLabel) {
  if (!OPENROUTER_API_KEY) {
    // Fallback messages
    const messages = {
      high: "You're doing great! Keep up the excellent focus.",
      medium: "Your focus is dropping slightly. Take a deep breath and refocus.",
      low: "Looks like you're getting tired. Take a 3-minute walk and come back stronger!"
    };
    return focusScore >= 70 ? messages.high : focusScore >= 40 ? messages.medium : messages.low;
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful study coach. Give short, encouraging messages (max 50 words) to help students stay focused.'
          },
          {
            role: 'user',
            content: `The student's current focus score is ${focusScore}/100 (${focusLabel}). Generate a motivating message to help them stay focused.`
          }
        ],
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenRouter error:', error.message);
    return "Stay focused! You've got this.";
  }
}

// Generate voice using ElevenLabs
async function generateVoice(text) {
  if (!ELEVENLABS_API_KEY) {
    return null;
  }

  try {
    const response = await axios.post(
      `${ELEVENLABS_URL}/${process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'}`,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert to base64 data URL
    const base64 = Buffer.from(response.data).toString('base64');
    return `data:audio/mpeg;base64,${base64}`;
  } catch (error) {
    console.error('ElevenLabs error:', error.message);
    return null;
  }
}

// Submit focus tracking data
router.post('/track', async (req, res) => {
  try {
    console.log('📥 Received focus tracking request:', req.body);
    const { userId, sessionId, typingSpeed, idleTime, tabSwitches } = req.body;

    if (!userId) {
      console.error('❌ User ID missing in request');
      return res.status(400).json({ error: 'User ID required' });
    }

    console.log('🔮 Getting ML prediction...');
    // Get ML prediction
    const prediction = await predictFocusScore(typingSpeed || 0, idleTime || 0, tabSwitches || 0);
    const focusScore = prediction.focus_score || prediction.focusScore || 75;
    const focusLabel = prediction.focus_label || prediction.focusLabel || 'Focused';
    console.log('✅ ML prediction:', { focusScore, focusLabel });

    // Generate AI message if focus is dropping
    let aiMessage = null;
    let voiceUrl = null;

    if (focusScore < 60) {
      console.log('💬 Generating AI message...');
      aiMessage = await generateAIMessage(focusScore, focusLabel);
      if (focusScore < 40) {
        // Generate voice for low focus
        console.log('🔊 Generating voice feedback...');
        voiceUrl = await generateVoice(aiMessage);
      }
    }

    // Save focus data
    console.log('💾 Saving FocusData to MongoDB...');
    const focusData = new FocusData({
      userId,
      sessionId: sessionId || null,
      typingSpeed: typingSpeed || 0,
      idleTime: idleTime || 0,
      tabSwitches: tabSwitches || 0,
      focusScore,
      focusLabel,
      aiMessage,
      voiceUrl
    });

    const savedData = await focusData.save();
    console.log('✅ FocusData saved:', savedData._id);

    // Update session if exists
    if (sessionId) {
      console.log('🔄 Updating session with focus data point...');
      const session = await FocusSession.findById(sessionId);
      if (session) {
        const dataPoint = {
          timestamp: new Date(),
          typingSpeed: typingSpeed || 0,
          idleTime: idleTime || 0,
          tabSwitches: tabSwitches || 0,
          focusScore,
          aiMessage,
          voiceUrl
        };
        
        session.focusDataPoints.push(dataPoint);
        console.log('📊 Session focusDataPoints count:', session.focusDataPoints.length);

        // Update session stats
        const scores = session.focusDataPoints.map(p => p.focusScore);
        session.averageFocusScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        session.maxFocusScore = Math.max(...scores);
        session.minFocusScore = Math.min(...scores);

        await session.save();
        console.log('✅ Session updated with new focus data point');
      } else {
        console.warn('⚠️ Session not found:', sessionId);
      }
    } else {
      console.log('ℹ️ No sessionId provided, skipping session update');
    }

    res.json({
      focusScore,
      focusLabel,
      aiMessage,
      voiceUrl
    });
  } catch (error) {
    console.error('Error in /focus/track:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get focus history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    const query = { userId };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const data = await FocusData.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('timestamp typingSpeed idleTime tabSwitches focusScore focusLabel');

    res.json(data);
  } catch (error) {
    console.error('Error fetching focus history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get focus analytics
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const data = await FocusData.find({
      userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    const scores = data.map(d => d.focusScore);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Group by hour
    const hourlyData = {};
    data.forEach(d => {
      const hour = new Date(d.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { count: 0, total: 0 };
      }
      hourlyData[hour].count++;
      hourlyData[hour].total += d.focusScore;
    });

    const bestHour = Object.entries(hourlyData)
      .map(([hour, stats]) => ({
        hour: parseInt(hour),
        avgScore: stats.total / stats.count
      }))
      .sort((a, b) => b.avgScore - a.avgScore)[0];

    res.json({
      averageScore: avgScore,
      totalDataPoints: data.length,
      bestHour: bestHour?.hour || null,
      dailyData: data.map(d => ({
        date: d.timestamp.toISOString().split('T')[0],
        score: d.focusScore
      }))
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

