const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  // Generate invoice PDF
  async generateInvoicePDF(payment, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(outputPath);
        
        doc.pipe(writeStream);

        // Header
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text('Nursery Management System', 50, 50);
        
        doc.fontSize(10)
           .font('Helvetica')
           .text('123 Preschool Lane', 50, 75)
           .text('Education City, EC 12345', 50, 90)
           .text('Phone: (555) 123-4567', 50, 105);

        // Invoice title
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('INVOICE', 400, 50)
           .fontSize(10)
           .font('Helvetica')
           .text(`Invoice #: ${payment.invoiceNumber}`, 400, 75)
           .text(`Date: ${new Date().toLocaleDateString()}`, 400, 90)
           .text(`Due Date: ${new Date(payment.dueDate).toLocaleDateString()}`, 400, 105);

        // Bill to section
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Bill to:', 50, 150)
           .font('Helvetica')
           .fontSize(10)
           .text(`${payment.parent.firstName} ${payment.parent.lastName}`, 50, 170)
           .text(payment.parent.email, 50, 185);

        // Child information
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Child:', 250, 150)
           .font('Helvetica')
           .fontSize(10)
           .text(`${payment.child.firstName} ${payment.child.lastName}`, 250, 170)
           .text(`Period: ${payment.period.month}/${payment.period.year}`, 250, 185);

        // Line
        doc.moveTo(50, 220)
           .lineTo(550, 220)
           .stroke();

        // Table header
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Description', 50, 240)
           .text('Amount', 450, 240);

        let yPosition = 260;

        // Breakdown items
        payment.breakdown.forEach(item => {
          doc.font('Helvetica')
             .fontSize(9)
             .text(item.description, 50, yPosition, { width: 350 })
             .text(`$${item.amount.toFixed(2)}`, 450, yPosition);
          
          yPosition += 20;
        });

        // Totals
        yPosition += 20;
        doc.moveTo(350, yPosition)
           .lineTo(550, yPosition)
           .stroke();

        yPosition += 20;
        doc.font('Helvetica')
           .text('Subtotal:', 400, yPosition)
           .text(`$${payment.amount.toFixed(2)}`, 500, yPosition);

        yPosition += 20;
        doc.text('Tax:', 400, yPosition)
           .text(`$${payment.taxAmount.toFixed(2)}`, 500, yPosition);

        yPosition += 20;
        doc.font('Helvetica-Bold')
           .text('Total:', 400, yPosition)
           .text(`$${payment.totalAmount.toFixed(2)}`, 500, yPosition);

        // Payment status
        yPosition += 40;
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .text(`Status: ${payment.status.toUpperCase()}`, 50, yPosition);

        if (payment.status === 'paid') {
          doc.text(`Paid on: ${new Date(payment.paymentDate).toLocaleDateString()}`, 50, yPosition + 20);
        }

        // Footer
        const footerY = 750;
        doc.fontSize(8)
           .font('Helvetica')
           .text('Thank you for your business!', 50, footerY)
           .text('Please contact us with any questions.', 50, footerY + 15);

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
  }

  // Generate attendance report PDF
  async generateAttendanceReportPDF(attendanceData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(outputPath);
        
        doc.pipe(writeStream);

        // Header
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text('Attendance Report', 50, 50);

        doc.fontSize(10)
           .font('Helvetica')
           .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);

        let yPosition = 120;

        // Table header
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Child Name', 50, yPosition)
           .text('Total Days', 200, yPosition)
           .text('Avg Hours/Day', 300, yPosition)
           .text('Total Hours', 400, yPosition);

        yPosition += 20;

        // Attendance data
        attendanceData.forEach(item => {
          doc.font('Helvetica')
             .fontSize(9)
             .text(item.childName, 50, yPosition, { width: 140 })
             .text(item.totalDays.toString(), 200, yPosition)
             .text((item.averageDuration / 60).toFixed(1), 300, yPosition)
             .text((item.totalDays * item.averageDuration / 60).toFixed(1), 400, yPosition);
          
          yPosition += 15;
        });

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
  }
}

module.exports = new PDFService();