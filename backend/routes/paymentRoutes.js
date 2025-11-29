const express = require('express');
const {
  generateInvoices,
  getInvoices,
  updateInvoice,
  processPayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Different access levels for different routes
router.get('/', authorize('parent', 'admin'), getInvoices);
router.post('/generate', authorize('admin'), generateInvoices);
router.put('/:id', authorize('admin'), updateInvoice);
router.post('/:id/process', authorize('parent', 'admin'), processPayment);

module.exports = router;