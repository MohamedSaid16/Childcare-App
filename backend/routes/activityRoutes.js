const express = require('express');
const {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  addActivityObservation
} = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('employee', 'admin'));

router.route('/')
  .get(getActivities)
  .post(createActivity);

router.route('/:id')
  .get(getActivity)
  .put(updateActivity)
  .delete(deleteActivity);

router.post('/:id/observations', addActivityObservation);

module.exports = router;