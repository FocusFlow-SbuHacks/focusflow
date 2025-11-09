const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  totalFocusTime: {
    type: Number,
    default: 0 // in minutes
  },
  emailNotifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    focusDropAlerts: {
      type: Boolean,
      default: true
    },
    sessionSummaries: {
      type: Boolean,
      default: false
    },
    weeklyReports: {
      type: Boolean,
      default: false
    }
  }
});

module.exports = mongoose.model('User', userSchema);

