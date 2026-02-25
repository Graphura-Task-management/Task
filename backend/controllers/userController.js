const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get admin dashboard statistics
// @route   GET /api/users/dashboard/stats
// @access  Private/Admin
const getAdminDashboardStats = async (req, res) => {
  try {
    // Get total projects count
    const totalProjects = await Project.countDocuments();
    
    // Get active projects count
    const activeProjects = await Project.countDocuments({ status: 'active' });
    
    // Get completed projects count
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    
    // Get total leaders count
    const totalLeaders = await User.countDocuments({ role: 'leader', isActive: true });
    
    // Get late projects (deadline passed but not completed)
    const lateProjects = await Project.countDocuments({
      deadline: { $lt: new Date() },
      status: { $nin: ['completed', 'cancelled'] }
    });
    
    // Calculate average progress
    const allProjects = await Project.find().populate('leader');
    let totalProgress = 0;
    
    for (const project of allProjects) {
      const projectTasks = await Task.find({ project: project._id });
      if (projectTasks.length > 0) {
        const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
        const progress = (completedTasks / projectTasks.length) * 100;
        totalProgress += progress;
      }
    }
    
    const avgProgress = allProjects.length > 0 
      ? Math.round(totalProgress / allProjects.length) 
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalLeaders,
        lateProjects,
        avgProgress
      }
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get leader details with statistics
// @route   GET /api/users/leaders/:id/details
// @access  Private/Admin
const getLeaderDetails = async (req, res) => {
  try {
    const leader = await User.findById(req.params.id)
      .populate('assignedProjects', 'name domain status deadline')
      .select('-password');

    if (!leader || leader.role !== 'leader') {
      return res.status(404).json({
        success: false,
        message: 'Leader not found'
      });
    }

    // Get team count (employees reporting to this leader)
    const teamCount = await User.countDocuments({
      reportingTo: leader._id,
      role: 'employee',
      isActive: true
    });

    // Get all tasks assigned by this leader
    const allTasks = await Task.find({ assignedBy: leader._id });
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;

    // Get team members list
    const teamMembers = await User.find({
      reportingTo: leader._id,
      role: 'employee',
      isActive: true
    }).select('name email domain');

    res.status(200).json({
      success: true,
      leader: {
        _id: leader._id,
        name: leader.name,
        email: leader.email,
        domain: leader.domain,
        phoneNumber: leader.phoneNumber,
        role: leader.role,
        assignedProjects: leader.assignedProjects,
        statistics: {
          totalTasks: allTasks.length,
          completedTasks: completedTasks,
          teamCount: teamCount,
          projectCount: leader.assignedProjects.length
        },
        teamMembers: teamMembers
      }
    });

  } catch (error) {
    console.error('Get Leader Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leader details',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, domain, isActive } = req.query;
    let query = {};

    if (role) query.role = role;
    if (domain) query.domain = domain;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .populate('reportingTo', 'name email role')
      .populate('assignedProjects', 'name domain')
      .select('-password')
      .sort('name');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('reportingTo', 'name email role domain')
      .populate('assignedProjects', 'name description domain deadline')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    console.log("helo");
    console.log(req.user);
    console.log(req.body);
    const { name, email,domain} = req.body;

    const user = await User.findById(req.user._id);
// console.log(user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    // if (role) user.role = role;
    if (domain) user.domain = domain;
    // if (phoneNumber) user.phoneNumber = phoneNumber;
    // if (reportingTo) user.reportingTo = reportingTo;
    // if (isActive !== undefined) user.isActive = isActive;

  const t = await user.save();
  console.log(t);
  

    const updatedUser = await User.findById(user._id)
      .populate('reportingTo', 'name email role')
      .select('-password');
      console.log(updatedUser);
      

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating user',
      error: error.message
    });
  }
};

// Delete user
// DELETE /api/users/:id
//  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: error.message
    });
  }
};

//  Get all leaders with detailed stats
//  GET /api/users/leaders
//  Private/Admin
const getLeaders = async (req, res) => {
  try {
    const leaders = await User.find({ role: 'leader', isActive: true })
      .populate('assignedProjects', 'name domain status')
      .select('-password')
      .sort('name');

    // Get statistics for each leader
    const leadersWithStats = await Promise.all(
      leaders.map(async (leader) => {
        // Count team members
        const teamCount = await User.countDocuments({
          reportingTo: leader._id,
          role: 'employee',
          isActive: true
        });

        // Get tasks statistics
        const allTasks = await Task.find({ assignedBy: leader._id });
        const completedTasks = allTasks.filter(t => t.status === 'completed').length;

        return {
          _id: leader._id,
          name: leader.name,
          email: leader.email,
          domain: leader.domain,
          phoneNumber: leader.phoneNumber,
          role: leader.role,
          assignedProjects: leader.assignedProjects,
          statistics: {
            teams: teamCount,
            totalTasks: allTasks.length,
            completedTasks: completedTasks,
            staff: teamCount // Same as teams for the UI shown
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      count: leadersWithStats.length,
      leaders: leadersWithStats
    });

  } catch (error) {
    console.error('Get Leaders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaders',
      error: error.message
    });
  }
};

// @desc    Get all employees
// @route   GET /api/users/employees
// @access  Private/Admin,Leader
const getEmployees = async (req, res) => {
  try {
    let query = { role: 'employee', isActive: true };

    // If leader, only show their team members
    if (req.user.role === 'leader') {
      query.reportingTo = req.user.id;
    }

    const employees = await User.find(query)
      .populate('reportingTo', 'name email')
      .select('-password')
      .sort('name');

    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employees',
      error: error.message
    });
  }
};

// @desc    Get team members (for leader)
// @route   GET /api/users/my-team
// @access  Private/Leader
const getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await User.find({
      reportingTo: req.user.id,
      role: 'employee',
      isActive: true
    })
      .select('-password')
      .sort('name');

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      teamMembers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching team members',
      error: error.message
    });
  }
};

module.exports = {
     getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getLeaders,
  getEmployees,
  getTeamMembers,
  getAdminDashboardStats,
  getLeaderDetails
}