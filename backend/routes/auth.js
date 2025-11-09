const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get or create user from Auth0
router.post('/user', async (req, res) => {
  try {
    const { auth0Id, email, name, picture } = req.body;

    if (!auth0Id || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let user = await User.findOne({ auth0Id });

    if (!user) {
      user = new User({
        auth0Id,
        email,
        name,
        picture
      });
      await user.save();
    } else {
      // Update last active
      user.lastActive = new Date();
      if (picture) user.picture = picture;
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Error in /auth/user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
router.get('/user/:auth0Id', async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.auth0Id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user preferences
router.patch('/user/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const { emailNotifications } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (emailNotifications) {
      user.emailNotifications = {
        enabled: emailNotifications.enabled !== undefined ? emailNotifications.enabled : (user.emailNotifications?.enabled ?? true),
        focusDropAlerts: emailNotifications.focusDropAlerts !== undefined ? emailNotifications.focusDropAlerts : (user.emailNotifications?.focusDropAlerts ?? true),
        sessionSummaries: emailNotifications.sessionSummaries !== undefined ? emailNotifications.sessionSummaries : (user.emailNotifications?.sessionSummaries ?? false),
        weeklyReports: emailNotifications.weeklyReports !== undefined ? emailNotifications.weeklyReports : (user.emailNotifications?.weeklyReports ?? false),
      };
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

