const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Role-based access control middleware
 * @param {...String} roles - Allowed roles
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists and has role
    if (!req.user) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    // Check if user role is included in allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route. Allowed roles: ${roles.join(', ')}`,
          403
        )
      );
    }

    // Additional role-specific checks
    switch (req.user.role) {
      case 'parent':
        // Parents can only access their own data
        if (req.params.parentId && req.params.parentId !== req.user.id) {
          return next(new ErrorResponse('Not authorized to access this parent data', 403));
        }
        break;
      
      case 'employee':
        // Employees can access their classroom data
        // Additional checks can be added in specific routes
        break;
      
      case 'admin':
        // Admins have full access
        break;
      
      default:
        return next(new ErrorResponse('Invalid user role', 403));
    }

    next();
  };
};

/**
 * Check if user can access child data
 * Parents can only access their own children
 * Employees can access children in their classroom
 * Admins can access all children
 */
const canAccessChild = async (req, res, next) => {
  try {
    const Child = require('../models/Child');
    const { childId } = req.params;

    if (!childId) {
      return next(new ErrorResponse('Child ID is required', 400));
    }

    const child = await Child.findById(childId);
    if (!child) {
      return next(new ErrorResponse('Child not found', 404));
    }

    // Admins can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Parents can only access their own children
    if (req.user.role === 'parent') {
      if (child.parent.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to access this child', 403));
      }
      return next();
    }

    // Employees can access children in their classroom
    if (req.user.role === 'employee') {
      const Classroom = require('../models/Classroom');
      const classroom = await Classroom.findOne({ assignedTeacher: req.user.id });
      
      if (!classroom) {
        return next(new ErrorResponse('No classroom assigned', 403));
      }

      if (!classroom.children.includes(childId)) {
        return next(new ErrorResponse('Child not in your classroom', 403));
      }
      
      return next();
    }

    return next(new ErrorResponse('Not authorized', 403));
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can access classroom data
 */
const canAccessClassroom = async (req, res, next) => {
  try {
    const Classroom = require('../models/Classroom');
    const { classroomId } = req.params;

    if (!classroomId) {
      return next(new ErrorResponse('Classroom ID is required', 400));
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return next(new ErrorResponse('Classroom not found', 404));
    }

    // Admins can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Employees can only access their assigned classroom
    if (req.user.role === 'employee') {
      if (classroom.assignedTeacher.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to access this classroom', 403));
      }
      return next();
    }

    // Parents cannot directly access classroom data
    if (req.user.role === 'parent') {
      return next(new ErrorResponse('Not authorized to access classroom data', 403));
    }

    return next(new ErrorResponse('Not authorized', 403));
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can manage payments
 */
const canManagePayments = (req, res, next) => {
  const { paymentId } = req.params;

  // Admins can manage all payments
  if (req.user.role === 'admin') {
    return next();
  }

  // Parents can only manage their own payments
  if (req.user.role === 'parent') {
    // This check will be done in the controller by verifying payment ownership
    return next();
  }

  // Employees cannot manage payments
  return next(new ErrorResponse('Not authorized to manage payments', 403));
};

/**
 * Check if user can manage users
 * Only admins can manage users
 */
const canManageUsers = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Only administrators can manage users', 403));
  }
  next();
};

/**
 * Check if user can manage system settings
 * Only admins can manage system settings
 */
const canManageSystem = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Only administrators can manage system settings', 403));
  }
  next();
};

/**
 * Check if user can generate reports
 * Admins and employees can generate reports (with different scopes)
 */
const canGenerateReports = (req, res, next) => {
  if (!['admin', 'employee'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to generate reports', 403));
  }
  next();
};

module.exports = {
  authorize,
  canAccessChild,
  canAccessClassroom,
  canManagePayments,
  canManageUsers,
  canManageSystem,
  canGenerateReports
};