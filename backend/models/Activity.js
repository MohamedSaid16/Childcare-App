const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['educational', 'creative', 'physical', 'social', 'musical'],
    required: true
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  },
  conductedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: Date,
  endTime: Date,
  participants: [{
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child'
    },
    observations: String,
    mood: {
      type: String,
      enum: ['happy', 'calm', 'excited', 'tired', 'sad']
    }
  }],
  materials: [String],
  photos: [String],
  learningObjectives: [String],
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema);