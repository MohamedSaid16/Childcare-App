const Payment = require('../models/Payment');
const Child = require('../models/Child');
const Attendance = require('../models/Attendance');

// Configuration
const HOURLY_RATE = 15; // $15 per hour
const TAX_RATE = 0.1; // 10% tax
const FULL_DAY_HOURS = 8; // 8 hours considered full day
const FULL_DAY_RATE = 100; // $100 for full day

class BillingService {
  // Generate monthly invoices for all active children
  async generateMonthlyInvoices(periodStart, periodEnd, dueDate) {
    try {
      const activeChildren = await Child.find({ isActive: true })
        .populate('parent', 'firstName lastName email');

      const invoices = [];

      for (const child of activeChildren) {
        const invoice = await this.generateInvoiceForChild(
          child,
          periodStart,
          periodEnd,
          dueDate
        );
        
        if (invoice) {
          invoices.push(invoice);
        }
      }

      return invoices;
    } catch (error) {
      throw error;
    }
  }

  // Generate invoice for a specific child
  async generateInvoiceForChild(child, periodStart, periodEnd, dueDate) {
    try {
      // Calculate attendance for the period
      const attendanceRecords = await Attendance.find({
        child: child._id,
        date: {
          $gte: new Date(periodStart),
          $lte: new Date(periodEnd)
        },
        status: 'present'
      });

      if (attendanceRecords.length === 0) {
        return null; // No attendance, no invoice
      }

      // Calculate total hours and amount
      let totalHours = 0;
      const breakdown = [];

      for (const record of attendanceRecords) {
        if (record.duration) {
          const hours = record.duration / 60; // Convert minutes to hours
          totalHours += hours;

          // Calculate cost for this day
          let dayCost = 0;
          if (hours >= FULL_DAY_HOURS) {
            dayCost = FULL_DAY_RATE;
          } else {
            dayCost = hours * HOURLY_RATE;
          }

          breakdown.push({
            description: `Attendance on ${record.date.toLocaleDateString()}`,
            amount: dayCost,
            quantity: 1,
            hours: Math.round(hours * 100) / 100
          });
        }
      }

      // Calculate totals
      const subtotal = breakdown.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * TAX_RATE;
      const totalAmount = subtotal + taxAmount;

      // Create payment record
      const payment = await Payment.create({
        parent: child.parent._id,
        child: child._id,
        period: {
          startDate: new Date(periodStart),
          endDate: new Date(periodEnd),
          month: new Date(periodStart).getMonth() + 1,
          year: new Date(periodStart).getFullYear()
        },
        amount: subtotal,
        taxAmount: Math.round(taxAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        dueDate: new Date(dueDate),
        breakdown: breakdown,
        status: 'pending'
      });

      return await Payment.findById(payment._id)
        .populate('parent', 'firstName lastName')
        .populate('child', 'firstName lastName');
    } catch (error) {
      throw error;
    }
  }

  // Calculate cost for a single attendance record
  calculateAttendanceCost(durationMinutes) {
    const hours = durationMinutes / 60;
    
    if (hours >= FULL_DAY_HOURS) {
      return FULL_DAY_RATE;
    } else {
      return hours * HOURLY_RATE;
    }
  }

  // Apply discount to invoice
  applyDiscount(invoiceAmount, discountType, discountValue) {
    let discountAmount = 0;

    if (discountType === 'percentage') {
      discountAmount = invoiceAmount * (discountValue / 100);
    } else if (discountType === 'fixed') {
      discountAmount = discountValue;
    }

    return Math.max(0, invoiceAmount - discountAmount);
  }
}

module.exports = new BillingService();