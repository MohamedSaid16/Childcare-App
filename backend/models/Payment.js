const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  period: {
    startDate: Date,
    endDate: Date,
    month: Number,
    year: Number
  },
  amount: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  dueDate: Date,
  paymentDate: Date,
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'check']
  },
  transactionId: String,
  breakdown: [{
    description: String,
    amount: Number,
    quantity: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate invoice number before saving
paymentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Payment').countDocuments();
    this.invoiceNumber = `INV-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);