const Child = require('../models/Child');
const Attendance = require('../models/Attendance');
const Activity = require('../models/Activity');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get parent's children
// @route   GET /api/parent/children
// @access  Private (Parent)
exports.getMyChildren = async (req, res, next) => {
  try {
    const children = await Child.find({ parent: req.user.id })
      .populate('classroom', 'name capacity')
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

// @desc    Register new child
// @route   POST /api/parent/children
// @access  Private (Parent)
exports.registerChild = async (req, res, next) => {
  try {
    req.body.parent = req.user.id;
    
    const child = await Child.create(req.body);

    // Create notification for admin
    await Notification.create({
      user: req.user.id, // or find admin users
      type: 'system',
      title: 'New Child Registration',
      message: `${req.user.firstName} ${req.user.lastName} registered a new child: ${child.firstName} ${child.lastName}`,
      relatedEntity: 'child',
      relatedId: child._id,
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      data: child
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get child's attendance
// @route   GET /api/parent/children/:childId/attendance
// @access  Private (Parent)
exports.getChildAttendance = async (req, res, next) => {
  try {
    const { childId } = req.params;
    
    // Verify child belongs to parent
    const child = await Child.findOne({ _id: childId, parent: req.user.id });
    if (!child) {
      return next(new ErrorResponse('Child not found', 404));
    }

    const attendance = await Attendance.find({ child: childId })
      .populate('recordedBy', 'firstName lastName')
      .sort({ date: -1 })
      .limit(30); // Last 30 days

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get child's activities
// @route   GET /api/parent/children/:childId/activities
// @access  Private (Parent)
exports.getChildActivities = async (req, res, next) => {
  try {
    const { childId } = req.params;
    
    // Verify child belongs to parent
    const child = await Child.findOne({ _id: childId, parent: req.user.id });
    if (!child) {
      return next(new ErrorResponse('Child not found', 404));
    }

    const activities = await Activity.find({
      'participants.child': childId
    })
      .populate('conductedBy', 'firstName lastName')
      .populate('classroom', 'name')
      .sort({ date: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get parent's payments
// @route   GET /api/parent/payments
// @access  Private (Parent)
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ parent: req.user.id })
      .populate('child', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Make payment
// @route   POST /api/parent/payments/:paymentId/pay
// @access  Private (Parent)
exports.makePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod, transactionId } = req.body;

    const payment = await Payment.findOne({
      _id: paymentId,
      parent: req.user.id
    });

    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    if (payment.status === 'paid') {
      return next(new ErrorResponse('Payment already completed', 400));
    }

    payment.status = 'paid';
    payment.paymentMethod = paymentMethod;
    payment.transactionId = transactionId;
    payment.paymentDate = new Date();

    await payment.save();

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'payment',
      title: 'Payment Confirmed',
      message: `Your payment of $${payment.totalAmount} for ${payment.period.month}/${payment.period.year} has been confirmed.`,
      relatedEntity: 'payment',
      relatedId: payment._id
    });

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};