


const Project = require("../models/Project")
const User = require('../models/User');
const Task = require("../models/Task");
const { notifyProjectAssigned } = require('./notificationController');
// Create new project (Admin only)
// POST /api/projects
// Private/Admin
const createProject = async (req, res) => {
  try {
    const { name, description, domain, leader, deadline, teamMembers } = req.body;

    // Validation
    if (!name || !description || !domain || !leader || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if leader exists and has leader role
    const leaderUser = await User.findById(leader);
    if (!leaderUser || leaderUser.role !== 'leader') {
      return res.status(400).json({
        success: false,
        message: 'Invalid leader selected'
      });
    }

    // Check if leader's domain matches project domain
    if (leaderUser.domain !== domain) {
      return res.status(400).json({
        success: false,
        message: `Leader's domain (${leaderUser.domain}) does not match project domain (${domain})`
      });
    }

    // Create project
    const project = await Project.create({
      name,
      description,
      domain,
      leader,
      deadline,
      teamMembers: teamMembers || [],
      createdBy: req.user.id
    });

    // Add project to leader's assignedProjects
    await User.findByIdAndUpdate(leader, {
      $push: { assignedProjects: project._id }
    });

    const populatedProject = await Project.findById(project._id)
      .populate('leader', 'name email domain')
      .populate('teamMembers', 'name email domain')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject
    });

  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating project',
      error: error.message
    });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private/Admin,Leader
const getAllProjects = async (req, res) => {
  try {
    let query = {};

    // If leader, only show their projects
    if (req.user.role === 'leader') {
      query.leader = req.user.id;
    }

    const projects = await Project.find(query)
      .populate('leader', 'name email domain')
      .populate('teamMembers', 'name email domain')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects',
      error: error.message
    });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('leader', 'name email domain phoneNumber')
      .populate('teamMembers', 'name email domain phoneNumber')
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check access rights
    if (req.user.role === 'leader' && project.leader._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    res.status(200).json({
      success: true,
      project
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin,Leader
const updateProject = async (req, res) => {
  try {
    const { name, description, deadline, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update fields
    if (name) project.name = name;
    if (description) project.description = description;
    if (deadline) project.deadline = deadline;
    if (status) project.status = status;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('leader', 'name email domain')
      .populate('teamMembers', 'name email domain');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating project',
      error: error.message
    });
  }
};

//  Delete project
//  DELETE /api/projects/:id
//  Private/Admin


const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Authorization check - only project leader or admin can delete
    if (project.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this project'
      });
    }

    

    
    const taskDeleteResult = await Task.deleteMany({
      project: project._id
    });

    console.log(`Deleted ${taskDeleteResult.deletedCount} tasks for project ${project._id}`);

   
    
    // Get all team member IDs
    const teamMemberIds = project.teamMembers || [];

    // Clear reportingTo for all team members
    const userUpdateResult = await User.updateMany(
      { _id: { $in: teamMemberIds } },
      { $set: { reportingTo: null } }
    );

    console.log(`Cleared reportingTo for ${userUpdateResult.modifiedCount} team members`);

   
    
    await User.findByIdAndUpdate(project.leader, {
      $pull: { assignedProjects: project._id }
    });

    
    
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: `Project "${project.name}" deleted successfully`,
      deletedData: {
        projectId: project._id,
        projectName: project.name,
        deletedTasksCount: taskDeleteResult.deletedCount,
        teamMembersCleared: userUpdateResult.modifiedCount,
        teamMembers: teamMemberIds
      }
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting project',
      error: error.message
    });
  }
};



// Get my projects (for leader/employee)
// GET /api/projects/my-projects
// Private
const getMyProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'leader') {
      projects = await Project.find({ leader: req.user.id })
        .populate('teamMembers', 'name email domain').populate("createdBy" , "name email")
        .sort('-createdAt');
    } else if (req.user.role === 'employee') {
      projects = await Project.find({ teamMembers: req.user.id })
        .populate('leader', 'name email domain')
        .populate('teamMembers' , 'name email domain')
        .sort('-createdAt');
    } else {
      return res.status(403).json({
        success: false,
        message: 'Admins should use /api/projects endpoint'
      });
    }
    // console.log(projects);

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects',
      error: error.message
    });
  }
};

// Add team member to project
// POST /api/projects/:id/team/add
// Private/Admin,Leader
const addTeamMember = async (req, res) => {
  try {
    const { memberData } = req.body;
  
    const {name , domain , email , projectId} = memberData;
    // Validate required fields
    if (!name || !email || !domain || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, domain, and projectId'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if the logged-in user is the project leader
    if (project.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add members to this project'
      });
    }

    // Find user by email and domain
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(), 
      domain: domain 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No employee found with email "${email}" and domain "${domain}". Please check the details or contact admin.`
      });
    }

    // Check if user is already assigned to a project (has a reporting manager)
    if (user.reportingTo) {
      // Get the current project they're assigned to
      const currentProject = await Project.findOne({ 
        teamMembers: user._id 
      }).select('name');

      return res.status(400).json({
        success: false,
        message: `${user.name} is already assigned to "${currentProject?.name || 'another project'}". Please contact admin to reassign.`
      });
    }

    // Check if user is already in this project's team
    if (project.teamMembers.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: `${user.name} is already a member of this project`
      });
    }

    // Check if user is trying to add themselves (if they're a leader)
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot add yourself as a team member'
      });
    }

    // Add user to project team
    project.teamMembers.push(user._id);
    await project.save();

    // Update user's reporting manager
    user.reportingTo = req.user._id; // Set current user (leader) as reporting manager
    await user.save();


    const updatedProject = await Project.findById(project._id)
      .populate('teamMembers', 'name email domain role')
      .populate('leader', 'name email');


const assignedBy = await User.findById(req.user._id);
    await notifyProjectAssigned(project, user._id, assignedBy);
    

    res.status(200).json({
      success: true,
      message: `${user.name} has been successfully added to the team`,
      project: updatedProject,
      addedMember: {
        id: user._id,
        name: user.name,
        email: user.email,
        domain: user.domain,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error adding team member:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while adding team member',
      error: error.message
    });
  }
};



// Remove team member from project
// POST /api/projects/:id/team/remove
// Private/Admin,Leader
// const User = require('../models/User');


const removeTeamMember = async (req, res) => {
  try {
    const { memberId } = req.body;

    // Validate memberId
    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide memberId'
      });
    }

    // Find all projects where the user is a leader
    const projects = await Project.find({ leader: req.user._id });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No projects found'
      });
    }

    // Find the project that contains this team member
    let targetProject = null;
    for (const project of projects) {
      if (project.teamMembers.some(member => member.toString() === memberId)) {
        targetProject = project;
        break;
      }
    }

    // If member not found in any project
    if (!targetProject) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found in any of your projects'
      });
    }

    // ========================================
    // DELETE ALL TASKS ASSIGNED TO THIS MEMBER
    // ========================================
    
    // Find all tasks assigned to this member in this project
    const tasksToDelete = await Task.find({
      project: targetProject._id,
      assignedTo: memberId
    });

    // Delete all those tasks
    const deleteResult = await Task.deleteMany({
      project: targetProject._id,
      assignedTo: memberId
    });

    console.log(`Deleted ${deleteResult.deletedCount} tasks for member ${memberId}`);

    // Also remove member from tasks where they are in assignedTo array (if using array)
    await Task.updateMany(
      { 
        project: targetProject._id,
        assignedTo: { $in: [memberId] }
      },
      { 
        $pull: { assignedTo: memberId } 
      }
    );

    // ========================================
    // REMOVE MEMBER FROM PROJECT
    // ========================================
    
    targetProject.teamMembers = targetProject.teamMembers.filter(
      member => member.toString() !== memberId
    );

    await targetProject.save();

   
    
    const user = await User.findById(memberId);
    if (user) {
      user.reportingTo = null;
      await user.save();
    }

    
    const updatedProject = await Project.findById(targetProject._id)
      .populate('teamMembers', 'name email domain role')
      .populate('leader', 'name email');

    res.status(200).json({
      success: true,
      message: `Team member removed successfully. ${deleteResult.deletedCount} associated task(s) deleted.`,
      project: updatedProject,
      removedMemberId: memberId,
      deletedTasksCount: deleteResult.deletedCount,
      taskDetails: tasksToDelete.map(task => ({
        id: task._id,
        title: task.title,
        status: task.status
      }))
    });

  } catch (error) {
    console.error('Error removing team member:', error);
    
    // Handle MongoDB CastError
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while removing team member',
      error: error.message
    });
  }
};





module.exports = {
    createProject,
    removeTeamMember,
    addTeamMember,
    getMyProjects,
    deleteProject,
    updateProject,
    getProjectById,
    getAllProjects
}