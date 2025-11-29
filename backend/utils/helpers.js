const moment = require('moment');

// Format date for display
exports.formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD');
};

// Format time for display
exports.formatTime = (date) => {
  return moment(date).format('HH:mm');
};

// Calculate age from date of birth
exports.calculateAge = (dateOfBirth) => {
  return moment().diff(moment(dateOfBirth), 'years');
};

// Generate random password
exports.generateRandomPassword = (length = 8) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Validate email
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Calculate business days between two dates
exports.calculateBusinessDays = (startDate, endDate) => {
  let count = 0;
  const curDate = new Date(startDate.getTime());
  
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  
  return count;
};

// Format currency
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};