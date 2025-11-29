const express = require('express');
const {
  checkIn,
  checkOut,
  getTodayAttendance,
  updateAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('employee', 'admin'));

router.post('/checkin', checkIn);
router.put('/checkout/:attendanceId', checkOut);
router.get('/today', getTodayAttendance);
router.put('/:attendanceId', updateAttendance);

module.exports = router;