const express = require('express');
const {
  getMyClassroom,
  getClassroomChildren,
  recordActivity,
  getMyActivities,
  addChildNote,
  getChildNotes,
  reportMedicalAlert
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes protected and only for employees
router.use(protect);
router.use(authorize('employee', 'admin'));

router.get('/classroom', getMyClassroom);
router.get('/classroom/children', getClassroomChildren);
router.route('/activities')
  .get(getMyActivities)
  .post(recordActivity);
router.route('/child-notes')
  .get(getChildNotes)
  .post(addChildNote);
router.post('/medical-alerts', reportMedicalAlert);

module.exports = router;