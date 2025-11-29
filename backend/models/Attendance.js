const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: Date,
  status: {
    type: String,
    enum: ['present', 'absent', 'sick', 'vacation'],
    default: 'present'
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String,
  meals: {
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    snack: { type: Boolean, default: false }
  },
  napTime: {
    start: Date,
    end: Date,
    duration: Number // in minutes
  }
});

// Calculate duration when checkOut is set
attendanceSchema.pre('save', function(next) {
  if (this.checkOut && this.checkIn) {
    const duration = Math.round((this.checkOut - this.checkIn) / (1000 * 60)); // minutes
    this.duration = duration;
  }
  next();
});

// Index for efficient queries
attendanceSchema.index({ child: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);