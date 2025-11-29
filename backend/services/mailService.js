const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Send email with HTML content
  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      const mailOptions = {
        from: `"Nursery Management" <${process.env.EMAIL_USER}>`,
        to: Array.isArray(to) ? to.join(',') : to,
        subject: subject,
        html: htmlContent,
      };

      if (textContent) {
        mailOptions.text = textContent;
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  // Send welcome email to new parent
  async sendWelcomeEmail(parentEmail, parentName, childName) {
    const subject = 'Welcome to Our Nursery!';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background: #f4f4f4; padding: 10px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Our Nursery!</h1>
          </div>
          <div class="content">
            <p>Dear ${parentName},</p>
            <p>Welcome to our nursery family! We're excited to have ${childName} join us.</p>
            <p>Your account has been successfully created. You can now:</p>
            <ul>
              <li>Track your child's daily activities</li>
              <li>View attendance records</li>
              <li>Receive updates and notifications</li>
              <li>Make payments online</li>
            </ul>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>The Nursery Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Nursery Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(parentEmail, subject, htmlContent);
  }

  // Send invoice notification
  async sendInvoiceEmail(parentEmail, parentName, invoiceNumber, amount, dueDate) {
    const subject = `New Invoice #${invoiceNumber} Available`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .invoice-details { background: #f9f9f9; padding: 15px; margin: 15px 0; }
          .footer { background: #f4f4f4; padding: 10px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Invoice Available</h1>
          </div>
          <div class="content">
            <p>Dear ${parentName},</p>
            <p>A new invoice has been generated for your child's nursery fees.</p>
            
            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Due:</strong> $${amount}</p>
              <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
            </div>

            <p>Please log in to your parent portal to view the complete invoice and make payment.</p>
            <p>You can pay online using credit card, bank transfer, or in person at the nursery.</p>
            
            <p>If you have any questions about this invoice, please contact our billing department.</p>
            <p>Best regards,<br>The Nursery Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Nursery Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(parentEmail, subject, htmlContent);
  }

  // Send attendance notification
  async sendAttendanceNotification(parentEmail, parentName, childName, checkInTime, recordedBy) {
    const subject = `${childName} Checked In`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .info-box { background: #f9f9f9; padding: 15px; margin: 15px 0; }
          .footer { background: #f4f4f4; padding: 10px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Child Checked In</h1>
          </div>
          <div class="content">
            <p>Dear ${parentName},</p>
            <p>This is to confirm that ${childName} has been checked in at the nursery.</p>
            
            <div class="info-box">
              <p><strong>Child:</strong> ${childName}</p>
              <p><strong>Check-in Time:</strong> ${new Date(checkInTime).toLocaleString()}</p>
              <p><strong>Recorded By:</strong> ${recordedBy}</p>
            </div>

            <p>You will receive another notification when ${childName} is checked out.</p>
            <p>If you have any questions, please contact the nursery.</p>
            
            <p>Best regards,<br>The Nursery Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Nursery Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(parentEmail, subject, htmlContent);
  }

  // Send activity notification
  async sendActivityNotification(parentEmail, parentName, childName, activityTitle, activityDescription) {
    const subject = `New Activity: ${activityTitle}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .activity-box { background: #fff3e0; padding: 15px; margin: 15px 0; }
          .footer { background: #f4f4f4; padding: 10px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Activity Recorded</h1>
          </div>
          <div class="content">
            <p>Dear ${parentName},</p>
            <p>${childName} participated in a new activity today!</p>
            
            <div class="activity-box">
              <h3>${activityTitle}</h3>
              <p>${activityDescription || 'No additional description provided.'}</p>
            </div>

            <p>Log in to your parent portal to see more details and photos from the activity.</p>
            
            <p>Best regards,<br>The Nursery Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Nursery Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(parentEmail, subject, htmlContent);
  }

  // Send medical alert notification
  async sendMedicalAlert(parentEmail, parentName, childName, alertType, description, severity) {
    const subject = `MEDICAL ALERT: ${childName}`;
    const severityColors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      critical: '#D32F2F'
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${severityColors[severity]}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .alert-box { background: #ffebee; padding: 15px; margin: 15px 0; border-left: 4px solid ${severityColors[severity]}; }
          .footer { background: #f4f4f4; padding: 10px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Medical Alert</h1>
          </div>
          <div class="content">
            <p>Dear ${parentName},</p>
            
            <div class="alert-box">
              <h3>${alertType.toUpperCase()} - ${severity.toUpperCase()} SEVERITY</h3>
              <p><strong>Child:</strong> ${childName}</p>
              <p><strong>Description:</strong> ${description}</p>
              <p><strong>Reported:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p><strong>Please contact the nursery immediately for more information.</strong></p>
            <p>Phone: [Nursery Phone Number]</p>
            
            <p>Best regards,<br>The Nursery Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Nursery Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(parentEmail, subject, htmlContent);
  }
}

module.exports = new MailService();