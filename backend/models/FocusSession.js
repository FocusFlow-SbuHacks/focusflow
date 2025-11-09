const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  averageFocusScore: {
    type: Number,
    default: 0
  },
  maxFocusScore: {
    type: Number,
    default: 0
  },
  minFocusScore: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  task: {
    type: String,
    default: ''
  },
  mood: {
    type: String,
    default: '😊'
  },
  focusDataPoints: [{
    timestamp: Date,
    typingSpeed: Number, // keys per minute
    idleTime: Number, // seconds
    tabSwitches: Number,
    focusScore: Number,
    aiMessage: String,
    voiceUrl: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('FocusSession', focusSessionSchema);

