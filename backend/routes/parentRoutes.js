const express = require('express');
const {
  getMyChildren,
  registerChild,
  getChildAttendance,
  getChildActivities,
  getMyPayments,
  makePayment
} = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes protected and only for parents
router.use(protect);
router.use(authorize('parent'));

router.route('/children')
  .get(getMyChildren)
  .post(registerChild);

router.get('/children/:childId/attendance', getChildAttendance);
router.get('/children/:childId/activities', getChildActivities);
router.route('/payments')
  .get(getMyPayments);
router.post('/payments/:paymentId/pay', makePayment);

module.exports = router;