const Classroom = require('../models/Classroom');
const Activity = require('../models/Activity');
const Child = require('../models/Child');
const MedicalAlert = require('../models/MedicalAlert');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get employee's assigned classroom
// @route   GET /api/employee/classroom
// @access  Private (Employee)
exports.getMyClassroom = async (req, res, next) => {
  try {
    const classroom = await Classroom.findOne({ assignedTeacher: req.user.id })
      .populate('assignedTeacher', 'firstName lastName')
      .populate('children', 'firstName lastName dateOfBirth');

    if (!classroom) {
      return next(new ErrorResponse('No classroom assigned', 404));
    }

    res.status(200).json({
      success: true,
      data: classroom
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get children in employee's classroom
// @route   GET /api/employee/classroom/children
// @access  Private (Employee)
exports.getClassroomChildren = async (req, res, next) => {
  try {
    const classroom = await Classroom.findOne({ assignedTeacher: req.user.id });
    
    if (!classroom) {
      return next(new ErrorResponse('No classroom assigned', 404));
    }

    const children = await Child.find({ classroom: classroom._id })
      .populate('parent', 'firstName lastName phone');

    res.status(200).json({
      success: true,
      count: children.length,
      data: children
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record new activity
// @route   POST /api/employee/activities
// @access  Private (Employee)
exports.recordActivity = async (req, res, next) => {
  try {
    req.body.conductedBy = req.user.id;
    
    const activity = await Activity.create(req.body);

    // Create notifications for parents of participating children
    const populatedActivity = await Activity.findById(activity._id)
      .populate('participants.child', 'parent firstName lastName');

    for (const participant of populatedActivity.participants) {
      await Notification.create({
        user: participant.child.parent,
        type: 'activity',
        title: 'New Activity Recorded',
        message: `${participant.child.firstName} participated in ${activity.title}. ${activity.description || ''}`,
        relatedEntity: 'activity',
        relatedId: activity._id
      });
    }

    res.status(201).json({
      success: true,
      data: populatedActivity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee's activities
// @route   GET /api/employee/activities
// @access  Private (Employee)
exports.getMyActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ conductedBy: req.user.id })
      .populate('classroom', 'name')
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

// @desc    Add child note/observation
// @route   POST /api/employee/child-notes
// @access  Private (Employee)
exports.addChildNote = async (req, res, next) => {
  try {
    const { childId, note, category, mood } = req.body;

    // In a real app, you might have a separate ChildNote model
    // For now, we'll add it to the activity model as a simple observation
    const observation = await Activity.create({
      title: `Daily Note - ${category}`,
      description: note,
      type: 'social', // or appropriate type
      conductedBy: req.user.id,
      date: new Date(),
      participants: [{
        child: childId,
        observations: note,
        mood: mood
      }]
    });

    // Notify parent
    const child = await Child.findById(childId).populate('parent');
    
    await Notification.create({
      user: child.parent._id,
      type: 'activity',
      title: 'New Daily Note',
      message: `New note added for ${child.firstName}: ${note.substring(0, 100)}...`,
      relatedEntity: 'activity',
      relatedId: observation._id
    });

    res.status(201).json({
      success: true,
      data: observation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get child notes
// @route   GET /api/employee/child-notes
// @access  Private (Employee)
exports.getChildNotes = async (req, res, next) => {
  try {
    const { childId } = req.query;
    
    const notes = await Activity.find({
      'participants.child': childId,
      title: /Daily Note/
    })
      .populate('conductedBy', 'firstName lastName')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: notes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report medical alert
// @route   POST /api/employee/medical-alerts
// @access  Private (Employee)
exports.reportMedicalAlert = async (req, res, next) => {
  try {
    req.body.reportedBy = req.user.id;
    
    const medicalAlert = await MedicalAlert.create(req.body);

    const populatedAlert = await MedicalAlert.findById(medicalAlert._id)
      .populate('child', 'firstName lastName parent')
      .populate('reportedBy', 'firstName lastName');

    // Notify parent and admin
    await Notification.create({
      user: populatedAlert.child.parent,
      type: 'medical',
      title: 'Medical Alert',
      message: `Medical alert reported for ${populatedAlert.child.firstName}: ${medicalAlert.description}`,
      relatedEntity: 'medical',
      relatedId: medicalAlert._id,
      priority: medicalAlert.severity === 'critical' ? 'high' : 'medium'
    });

    // In real app, also notify admin users

    res.status(201).json({
      success: true,
      data: populatedAlert
    });
  } catch (error) {
    next(error);
  }
};