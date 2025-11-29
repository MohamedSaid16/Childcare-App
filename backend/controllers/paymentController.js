const Payment = require('../models/Payment');
const Child = require('../models/Child');
const Attendance = require('../models/Attendance');
const ErrorResponse = require('../utils/ErrorResponse');
const billingService = require('../services/billingService');

// @desc    Generate invoices for billing period
// @route   POST /api/payments/generate
// @access  Private (Admin)
exports.generateInvoices = async (req, res, next) => {
  try {
    const { periodStart, periodEnd, dueDate } = req.body;

    const invoices = await billingService.generateMonthlyInvoices(
      periodStart,
      periodEnd,
      dueDate
    );

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoices
// @route   GET /api/payments
// @access  Private (Parent, Admin)
exports.getInvoices = async (req, res, next) => {
  try {
    let query = {};
    
    // If user is parent, only show their invoices
    if (req.user.role === 'parent') {
      query.parent = req.user.id;
    }

    const payments = await Payment.find(query)
      .populate('parent', 'firstName lastName email')
      .populate('child', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice
// @route   PUT /api/payments/:id
// @access  Private (Admin)
exports.updateInvoice = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('parent', 'firstName lastName')
      .populate('child', 'firstName lastName');

    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process payment
// @route   POST /api/payments/:id/process
// @access  Private (Parent, Admin)
exports.processPayment = async (req, res, next) => {
  try {
    const { paymentMethod, transactionId } = req.body;

    let payment = await Payment.findById(req.params.id);

    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    // Check if user is authorized to process this payment
    if (req.user.role === 'parent' && payment.parent.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to process this payment', 403));
    }

    payment.status = 'paid';
    payment.paymentMethod = paymentMethod;
    payment.transactionId = transactionId;
    payment.paymentDate = new Date();

    await payment.save();

    payment = await Payment.findById(payment._id)
      .populate('parent', 'firstName lastName')
      .populate('child', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};