const Activity = require('../models/Activity');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private (Employee, Admin)
exports.getActivities = async (req, res, next) => {
  try {
    const { classroom, date, type } = req.query;
    
    let query = {};
    
    if (classroom) query.classroom = classroom;
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    }
    if (type) query.type = type;

    const activities = await Activity.find(query)
      .populate('classroom', 'name')
      .populate('conductedBy', 'firstName lastName')
      .populate('participants.child', 'firstName lastName')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Private (Employee, Admin)
exports.getActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('classroom', 'name')
      .populate('conductedBy', 'firstName lastName')
      .populate('participants.child', 'firstName lastName');

    if (!activity) {
      return next(new ErrorResponse('Activity not found', 404));
    }

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create activity
// @route   POST /api/activities
// @access  Private (Employee, Admin)
exports.createActivity = async (req, res, next) => {
  try {
    const activity = await Activity.create(req.body);

    const populatedActivity = await Activity.findById(activity._id)
      .populate('classroom', 'name')
      .populate('conductedBy', 'firstName lastName')
      .populate('participants.child', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: populatedActivity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private (Employee, Admin)
exports.updateActivity = async (req, res, next) => {
  try {
    let activity = await Activity.findById(req.params.id);

    if (!activity) {
      return next(new ErrorResponse('Activity not found', 404));
    }

    activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('classroom', 'name')
      .populate('conductedBy', 'firstName lastName')
      .populate('participants.child', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private (Employee, Admin)
exports.deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return next(new ErrorResponse('Activity not found', 404));
    }

    await Activity.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add observation to activity
// @route   POST /api/activities/:id/observations
// @access  Private (Employee, Admin)
exports.addActivityObservation = async (req, res, next) => {
  try {
    const { childId, observations, mood } = req.body;

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return next(new ErrorResponse('Activity not found', 404));
    }

    // Find if child already has observations
    const participantIndex = activity.participants.findIndex(
      p => p.child.toString() === childId
    );

    if (participantIndex > -1) {
      // Update existing observation
      activity.participants[participantIndex].observations = observations;
      activity.participants[participantIndex].mood = mood;
    } else {
      // Add new observation
      activity.participants.push({
        child: childId,
        observations,
        mood
      });
    }

    await activity.save();

    const populatedActivity = await Activity.findById(activity._id)
      .populate('participants.child', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: populatedActivity
    });
  } catch (error) {
    next(error);
  }
};