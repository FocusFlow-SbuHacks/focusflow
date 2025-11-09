const express = require('express');
const router = express.Router();
const FocusSession = require('../models/FocusSession');
const User = require('../models/User');

// Create a new focus session
router.post('/create', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Check for active session
    const activeSession = await FocusSession.findOne({
      userId,
      status: 'active'
    });

    if (activeSession) {
      return res.json(activeSession);
    }

    const session = new FocusSession({
      userId,
      startTime: new Date(),
      status: 'active'
    });

    await session.save();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { totalSessions: 1 },
      lastActive: new Date()
    });

    res.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active session
router.get('/active/:userId', async (req, res) => {
  try {
    const session = await FocusSession.findOne({
      userId: req.params.userId,
      status: 'active'
    }).populate('userId', 'name email');

    if (!session) {
      // Return 200 with null - no active session is a valid state, not an error
      return res.status(200).json(null);
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching active session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update session (pause/resume)
router.patch('/:sessionId', async (req, res) => {
  try {
    const { status, duration } = req.body;
    const session = await FocusSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (status) session.status = status;
    if (duration !== undefined) session.duration = duration;

    await session.save();
    res.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// End session
router.post('/:sessionId/end', async (req, res) => {
  try {
    const session = await FocusSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.endTime = new Date();
    session.status = 'completed';
    session.duration = Math.floor((session.endTime - session.startTime) / 1000);

    // Calculate final stats
    if (session.focusDataPoints.length > 0) {
      const scores = session.focusDataPoints.map(p => p.focusScore);
      session.averageFocusScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      session.maxFocusScore = Math.max(...scores);
      session.minFocusScore = Math.min(...scores);
    }

    await session.save();

    // Update user total focus time
    await User.findByIdAndUpdate(session.userId, {
      $inc: { totalFocusTime: Math.floor(session.duration / 60) }
    });

    res.json(session);
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get session history
router.get('/history/:userId', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const sessions = await FocusSession.find({
      userId: req.params.userId,
      status: 'completed'
    })
      .sort({ endTime: -1 })
      .limit(parseInt(limit))
      .select('startTime endTime duration averageFocusScore maxFocusScore minFocusScore');

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get session details
router.get('/:sessionId', async (req, res) => {
  try {
    const session = await FocusSession.findById(req.params.sessionId)
      .populate('userId', 'name email');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

