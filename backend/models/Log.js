const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['search', 'view', 'purchase', 'login', 'logout', 'cart_update']
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Flexible field for different types of logs
    default: {}
  }
}, {
  timestamps: true
});

// Add index for better query performance
logSchema.index({ userId: 1, action: 1, createdAt: -1 });

module.exports = mongoose.model('Log', logSchema); 