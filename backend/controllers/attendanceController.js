const Attendance = require('../models/Attendance');
const Child = require('../models/Child');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Check in child
// @route   POST /api/attendance/checkin
// @access  Private (Employee, Admin)
exports.checkIn = async (req, res, next) => {
  try {
    const { childId, notes } = req.body;

    // Check if child is already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await Attendance.findOne({
      child: childId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingAttendance) {
      return next(new ErrorResponse('Child is already checked in today', 400));
    }

    const attendance = await Attendance.create({
      child: childId,
      date: new Date(),
      checkIn: new Date(),
      recordedBy: req.user.id,
      notes,
      status: 'present'
    });

    // Populate child details for notification
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('child', 'firstName lastName parent')
      .populate('recordedBy', 'firstName lastName');

    // Create notification for parent
    await Notification.create({
      user: populatedAttendance.child.parent,
      type: 'attendance',
      title: 'Child Checked In',
      message: `${populatedAttendance.child.firstName} has been checked in by ${populatedAttendance.recordedBy.firstName}.`,
      relatedEntity: 'attendance',
      relatedId: attendance._id
    });

    res.status(201).json({
      success: true,
      data: populatedAttendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check out child
// @route   PUT /api/attendance/checkout/:attendanceId
// @access  Private (Employee, Admin)
exports.checkOut = async (req, res, next) => {
  try {
    const { attendanceId } = req.params;
    const { notes } = req.body;

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return next(new ErrorResponse('Attendance record not found', 404));
    }

    if (attendance.checkOut) {
      return next(new ErrorResponse('Child is already checked out', 400));
    }

    attendance.checkOut = new Date();
    attendance.notes = notes || attendance.notes;

    await attendance.save();

    // Populate for notification
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('child', 'firstName lastName parent')
      .populate('recordedBy', 'firstName lastName');

    // Create notification for parent
    await Notification.create({
      user: populatedAttendance.child.parent,
      type: 'attendance',
      title: 'Child Checked Out',
      message: `${populatedAttendance.child.firstName} has been checked out. Total time: ${Math.round(populatedAttendance.duration / 60)} hours.`,
      relatedEntity: 'attendance',
      relatedId: attendance._id
    });

    res.status(200).json({
      success: true,
      data: populatedAttendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's attendance
// @route   GET /api/attendance/today
// @access  Private (Employee, Admin)
exports.getTodayAttendance = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    })
      .populate('child', 'firstName lastName classroom')
      .populate('recordedBy', 'firstName lastName')
      .sort({ checkIn: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance (meals, nap, etc.)
// @route   PUT /api/attendance/:attendanceId
// @access  Private (Employee, Admin)
exports.updateAttendance = async (req, res, next) => {
  try {
    const { attendanceId } = req.params;

    const attendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('child', 'firstName lastName');

    if (!attendance) {
      return next(new ErrorResponse('Attendance record not found', 404));
    }

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};