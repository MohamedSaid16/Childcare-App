const User = require('../models/User');
const Child = require('../models/Child');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Activity = require('../models/Activity');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    // Remove password from update if present
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all children
// @route   GET /api/admin/children
// @access  Private (Admin)
exports.getAllChildren = async (req, res, next) => {
  try {
    const children = await Child.find()
      .populate('parent', 'firstName lastName email phone')
      .populate('classroom', 'name')
      .sort({ firstName: 1 });

    res.status(200).json({
      success: true,
      count: children.length,
      data: children
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single child
// @route   GET /api/admin/children/:id
// @access  Private (Admin)
exports.getChild = async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id)
      .populate('parent', 'firstName lastName email phone address')
      .populate('classroom', 'name capacity assignedTeacher');

    if (!child) {
      return next(new ErrorResponse('Child not found', 404));
    }

    res.status(200).json({
      success: true,
      data: child
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update child
// @route   PUT /api/admin/children/:id
// @access  Private (Admin)
exports.updateChild = async (req, res, next) => {
  try {
    const child = await Child.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('parent', 'firstName lastName');

    if (!child) {
      return next(new ErrorResponse('Child not found', 404));
    }

    res.status(200).json({
      success: true,
      data: child
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete child
// @route   DELETE /api/admin/children/:id
// @access  Private (Admin)
exports.deleteChild = async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return next(new ErrorResponse('Child not found', 404));
    }

    await Child.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalChildren,
      totalParents,
      totalEmployees,
      todayAttendance,
      pendingPayments,
      recentActivities
    ] = await Promise.all([
      Child.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'parent', isActive: true }),
      User.countDocuments({ role: 'employee', isActive: true }),
      Attendance.countDocuments({ date: { $gte: today } }),
      Payment.countDocuments({ status: 'pending' }),
      Activity.countDocuments({ date: { $gte: today } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalChildren,
        totalParents,
        totalEmployees,
        todayAttendance,
        pendingPayments,
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate reports
// @route   GET /api/admin/reports/:type
// @access  Private (Admin)
exports.generateReports = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let reportData;

    switch (type) {
      case 'attendance':
        reportData = await generateAttendanceReport(startDate, endDate);
        break;
      case 'payments':
        reportData = await generatePaymentsReport(startDate, endDate);
        break;
      case 'activities':
        reportData = await generateActivitiesReport(startDate, endDate);
        break;
      default:
        return next(new ErrorResponse('Invalid report type', 400));
    }

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions for reports
async function generateAttendanceReport(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const attendance = await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$child',
        totalDays: { $sum: 1 },
        averageDuration: { $avg: '$duration' }
      }
    },
    {
      $lookup: {
        from: 'children',
        localField: '_id',
        foreignField: '_id',
        as: 'child'
      }
    },
    { $unwind: '$child' },
    {
      $project: {
        childName: { $concat: ['$child.firstName', ' ', '$child.lastName'] },
        totalDays: 1,
        averageDuration: 1
      }
    }
  ]);

  return attendance;
}

async function generatePaymentsReport(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const payments = await Payment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  return payments;
}

async function generateActivitiesReport(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const activities = await Activity.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalParticipants: { $sum: { $size: '$participants' } }
      }
    }
  ]);

  return activities;
}