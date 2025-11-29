const mongoose = require('mongoose');

const medicalAlertSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  type: {
    type: String,
    enum: ['allergy', 'medication', 'condition', 'incident'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  symptoms: [String],
  treatment: String,
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedDate: {
    type: Date,
    default: Date.now
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedDate: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
});

module.exports = mongoose.model('MedicalAlert', medicalAlertSchema);