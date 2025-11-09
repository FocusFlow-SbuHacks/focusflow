const mongoose = require('mongoose');

const focusDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FocusSession',
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  typingSpeed: {
    type: Number, // keys per minute
    default: 0
  },
  idleTime: {
    type: Number, // seconds of inactivity
    default: 0
  },
  tabSwitches: {
    type: Number,
    default: 0
  },
  focusScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  focusLabel: {
    type: String,
    enum: ['Focused', 'Distracted', 'Losing Focus'],
    default: 'Focused'
  },
  aiMessage: {
    type: String
  },
  voiceUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
focusDataSchema.index({ userId: 1, timestamp: -1 });
focusDataSchema.index({ sessionId: 1, timestamp: -1 });

module.exports = mongoose.model('FocusData', focusDataSchema);

