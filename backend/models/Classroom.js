const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Classroom name is required'],
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Classroom capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  currentCount: {
    type: Number,
    default: 0
  },
  ageGroup: {
    minAge: { type: Number, required: true }, // in months
    maxAge: { type: Number, required: true }  // in months
  },
  assignedTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child'
  }],
  schedule: {
    startTime: String, // "08:00"
    endTime: String,   // "17:00"
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  facilities: [String], // toys, playground, nap area, etc.
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update current count when children are added/removed
classroomSchema.methods.updateCurrentCount = function() {
  this.currentCount = this.children.length;
  return this.save();
};

// Check if classroom has available capacity
classroomSchema.methods.hasCapacity = function() {
  return this.currentCount < this.capacity;
};

// Check if child fits age group
classroomSchema.methods.isAgeAppropriate = function(childAgeInMonths) {
  return childAgeInMonths >= this.ageGroup.minAge && 
         childAgeInMonths <= this.ageGroup.maxAge;
};

module.exports = mongoose.model('Classroom', classroomSchema);