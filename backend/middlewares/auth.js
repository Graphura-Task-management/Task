

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT Token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};


// Check if user can assign tasks to specific employees
const canAssignTask = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const currentUser = req.user;

    // Admin can assign to anyone
    if (currentUser.role === 'admin') {
      return next();
    }

    // Leader can only assign to their team members
    if (currentUser.role === 'leader') {
      const User = require('../models/User');
      
      // all employees under this leader
      const teamMembers = await User.find({
        reportingTo: currentUser._id,
        role: 'employee'
      }).select('_id');

      const teamMemberIds = teamMembers.map(member => member._id.toString());
      
      // Check if all assignedTo users are in leader's team
      const assignedToArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
      const isValid = assignedToArray.every(id => teamMemberIds.includes(id));

      if (!isValid) {
        return res.status(403).json({
          success: false,
          message: 'You can only assign tasks to your team members'
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error in role authorization'
    });
  }
};

// Check if user can manage project
const canManageProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const currentUser = req.user;

    // Admin can manage any project
    if (currentUser.role === 'admin') {
      return next();
    }

    // Leader can only manage their own projects
    if (currentUser.role === 'leader') {
      const Project = require('../models/Project');
      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      if (project.leader.toString() !== currentUser._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only manage your own projects'
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking project permissions'
    });
  }
};


module.exports = {
    protect,
    canManageProject,
    canAssignTask,
   authorize
}