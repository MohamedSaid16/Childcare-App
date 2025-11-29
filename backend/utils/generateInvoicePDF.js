const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate invoice PDF
 * @param {Object} payment - Payment object with populated fields
 * @param {string} outputPath - Path where PDF will be saved
 * @returns {Promise<string>} - Path to generated PDF
 */
const generateInvoicePDF = async (payment, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const writeStream = fs.createWriteStream(outputPath);
      
      doc.pipe(writeStream);

      // Add header with logo placeholder
      doc.fillColor('#2E86AB')
         .rect(0, 0, 600, 100)
         .fill();
      
      doc.fillColor('#ffffff')
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('NURSERY MANAGEMENT SYSTEM', 50, 40);

      // Invoice information
      doc.fillColor('#000000')
         .fontSize(16)
         .text('INVOICE', 400, 120)
         .fontSize(10)
         .text(`Invoice #: ${payment.invoiceNumber}`, 400, 145)
         .text(`Issue Date: ${new Date().toLocaleDateString()}`, 400, 160)
         .text(`Due Date: ${new Date(payment.dueDate).toLocaleDateString()}`, 400, 175);

      // Bill to section
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Bill to:', 50, 120)
         .font('Helvetica')
         .fontSize(10)
         .text(`${payment.parent.firstName} ${payment.parent.lastName}`, 50, 140)
         .text(payment.parent.email, 50, 155)
         .text(`Phone: ${payment.parent.phone}`, 50, 170);

      // Child information
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Child:', 50, 190)
         .font('Helvetica')
         .fontSize(10)
         .text(`${payment.child.firstName} ${payment.child.lastName}`, 50, 210)
         .text(`Billing Period: ${payment.period.month}/${payment.period.year}`, 50, 225);

      // Line separator
      doc.moveTo(50, 250)
         .lineTo(550, 250)
         .strokeColor('#cccccc')
         .stroke();

      // Table header
      doc.fillColor('#2E86AB')
         .rect(50, 260, 500, 20)
         .fill();
      
      doc.fillColor('#ffffff')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Description', 60, 265)
         .text('Hours', 350, 265)
         .text('Rate', 420, 265)
         .text('Amount', 500, 265, { width: 40, align: 'right' });

      let yPosition = 300;

      // Breakdown items
      payment.breakdown.forEach((item, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc.fillColor('#f8f9fa')
             .rect(50, yPosition - 10, 500, 20)
             .fill();
        }

        doc.fillColor('#000000')
           .fontSize(9)
           .font('Helvetica')
           .text(item.description, 60, yPosition, { width: 280 })
           .text(item.hours ? item.hours.toFixed(1) : 'N/A', 350, yPosition)
           .text('$' + (item.hours ? (item.amount / item.hours).toFixed(2) : '0.00'), 420, yPosition)
           .text('$' + item.amount.toFixed(2), 500, yPosition, { width: 40, align: 'right' });

        yPosition += 25;
      });

      // Totals section
      yPosition += 20;
      doc.moveTo(350, yPosition)
         .lineTo(550, yPosition)
         .stroke();

      yPosition += 20;
      doc.fontSize(10)
         .font('Helvetica')
         .text('Subtotal:', 450, yPosition)
         .text('$' + payment.amount.toFixed(2), 500, yPosition, { width: 40, align: 'right' });

      yPosition += 20;
      doc.text('Tax (10%):', 450, yPosition)
         .text('$' + payment.taxAmount.toFixed(2), 500, yPosition, { width: 40, align: 'right' });

      yPosition += 25;
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .text('TOTAL:', 450, yPosition)
         .text('$' + payment.totalAmount.toFixed(2), 500, yPosition, { width: 40, align: 'right' });

      // Payment status
      yPosition += 40;
      const statusColor = payment.status === 'paid' ? '#4CAF50' : 
                         payment.status === 'overdue' ? '#F44336' : '#FF9800';
      
      doc.fillColor(statusColor)
         .rect(50, yPosition, 100, 25)
         .fill();
      
      doc.fillColor('#ffffff')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(payment.status.toUpperCase(), 60, yPosition + 8);

      if (payment.status === 'paid') {
        doc.fillColor('#000000')
           .font('Helvetica')
           .text(`Paid on: ${new Date(payment.paymentDate).toLocaleDateString()}`, 160, yPosition + 8);
      }

      // Payment instructions
      yPosition += 60;
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .text('Payment Instructions:', 50, yPosition)
         .font('Helvetica')
         .text('Please make payment by the due date to avoid late fees.', 50, yPosition + 15)
         .text('Payment methods: Credit Card, Bank Transfer, or Cash at the nursery.', 50, yPosition + 30);

      // Footer
      const footerY = 750;
      doc.fontSize(8)
         .fillColor('#666666')
         .text('Thank you for choosing our nursery!', 50, footerY)
         .text('For questions about this invoice, contact: billing@nursery.com', 50, footerY + 12)
         .text('Nursery Management System - Providing quality childcare since 2024', 50, footerY + 24);

      // Page number
      doc.text(`Page 1 of 1`, 500, footerY + 24, { align: 'right' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(outputPath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate attendance report PDF
 * @param {Array} attendanceData - Array of attendance records
 * @param {Object} options - Report options (title, date range, etc.)
 * @param {string} outputPath - Path where PDF will be saved
 * @returns {Promise<string>} - Path to generated PDF
 */
const generateAttendanceReportPDF = async (attendanceData, options, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(outputPath);
      
      doc.pipe(writeStream);

      // Header
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#2E86AB')
         .text('ATTENDANCE REPORT', 50, 50);

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`Report: ${options.title || 'Monthly Attendance'}`, 50, 80)
         .text(`Period: ${options.startDate} to ${options.endDate}`, 50, 95)
         .text(`Generated: ${new Date().toLocaleDateString()}`, 50, 110);

      let yPosition = 150;

      // Summary statistics
      const totalChildren = attendanceData.length;
      const totalDays = attendanceData.reduce((sum, item) => sum + item.totalDays, 0);
      const totalHours = attendanceData.reduce((sum, item) => sum + (item.totalDays * item.averageDuration / 60), 0);

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Summary Statistics', 50, yPosition);

      yPosition += 25;
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Total Children: ${totalChildren}`, 50, yPosition)
         .text(`Total Attendance Days: ${totalDays}`, 200, yPosition)
         .text(`Total Hours: ${totalHours.toFixed(1)}`, 350, yPosition);

      yPosition += 40;

      // Table header
      doc.fillColor('#2E86AB')
         .rect(50, yPosition, 500, 20)
         .fill();
      
      doc.fillColor('#ffffff')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Child Name', 60, yPosition + 5)
         .text('Days Present', 200, yPosition + 5)
         .text('Avg Hours/Day', 300, yPosition + 5)
         .text('Total Hours', 400, yPosition + 5)
         .text('Attendance %', 500, yPosition + 5, { width: 40, align: 'right' });

      yPosition += 30;

      // Attendance data rows
      attendanceData.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.fillColor('#f8f9fa')
             .rect(50, yPosition - 5, 500, 20)
             .fill();
        }

        const attendancePercentage = ((item.totalDays / options.workingDays) * 100).toFixed(1);

        doc.fillColor('#000000')
           .fontSize(9)
           .font('Helvetica')
           .text(item.childName, 60, yPosition, { width: 130 })
           .text(item.totalDays.toString(), 200, yPosition)
           .text((item.averageDuration / 60).toFixed(1), 300, yPosition)
           .text((item.totalDays * item.averageDuration / 60).toFixed(1), 400, yPosition)
           .text(attendancePercentage + '%', 500, yPosition, { width: 40, align: 'right' });

        yPosition += 20;

        // Add new page if needed
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
          
          // Repeat table header on new page
          doc.fillColor('#2E86AB')
             .rect(50, yPosition, 500, 20)
             .fill();
          
          doc.fillColor('#ffffff')
             .fontSize(10)
             .font('Helvetica-Bold')
             .text('Child Name', 60, yPosition + 5)
             .text('Days Present', 200, yPosition + 5)
             .text('Avg Hours/Day', 300, yPosition + 5)
             .text('Total Hours', 400, yPosition + 5)
             .text('Attendance %', 500, yPosition + 5, { width: 40, align: 'right' });

          yPosition += 30;
        }
      });

      // Footer
      const footerY = 750;
      doc.fontSize(8)
         .fillColor('#666666')
         .text('Confidential - For internal use only', 50, footerY)
         .text(`Generated by Nursery Management System on ${new Date().toLocaleString()}`, 50, footerY + 12);

      doc.end();

      writeStream.on('finish', () => {
        resolve(outputPath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF,
  generateAttendanceReportPDF
};