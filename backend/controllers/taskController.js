const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { 
  notifyTaskAssigned, 
  notifyTaskStatusUpdated, 
  notifyTaskCompleted,
  notifyTaskDescriptionUpdated
} = require('./notificationController');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private/Admin,Leader
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      departments,
      startDate,
      dueDate,
      priority
    } = req.body;

    // Validation
    if (!title || !description || !project || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // If leader, check if they own the project
    if (req.user.role === 'leader') {
      if (projectExists.leader.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only create tasks for your own projects'
        });
      }
    }

    // Verify all assigned users exist and are employees
    const assignedToArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    const users = await User.find({ _id: { $in: assignedToArray } });

    if (users.length !== assignedToArray.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more assigned users not found'
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedToArray,
      assignedBy: req.user.id,
      departments: departments || [],
      startDate: startDate || Date.now(),
      dueDate,
      priority: priority || 'medium'
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name domain')
      .populate('assignedTo', 'name email domain')
      .populate('assignedBy', 'name email role');
         await notifyTaskAssigned(task, assignedToArray);



    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask
    });

  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating task',
      error: error.message
    });
  }
};

// @desc    Get all tasks (filtered by role)
// @route   GET /api/tasks
// @access  Private
const getAllTasks = async (req, res) => {
  try {
    const { status, priority, project } = req.query;
    let query = {};

    // Role-based filtering
    if (req.user.role === 'leader') {
      // Leader sees tasks they assigned
      query.assignedBy = req.user.id;
    } else if (req.user.role === 'employee') {
      // Employee sees tasks assigned to them
      query.assignedTo = req.user.id;
    }

    // Additional filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) query.project = project;

    const tasks = await Task.find(query)
      .populate('project', 'name domain')
      .populate('assignedTo', 'name email domain')
      .populate('assignedBy', 'name email role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks',
      error: error.message
    });
  }
};

// Get task by ID
// GET /api/tasks/:id
// Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name domain leader')
      .populate('assignedTo', 'name email domain phoneNumber')
      .populate('assignedBy', 'name email role')
      .populate('comments.user', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check access rights
    const isAssignedTo = task.assignedTo.some(user => user._id.toString() === req.user.id);
    const isAssignedBy = task.assignedBy._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAssignedTo && !isAssignedBy && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task'
      });
    }

    res.status(200).json({
      success: true,
      task
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task',
      error: error.message
    });
  }
};

// Update task
// PUT /api/tasks/:id
// Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    const isAssignedBy = task.assignedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAssignedBy && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // Allowed fields
    const allowedUpdates = [
      'title',
      'description',
      'dueDate',
      'priority',
      'status',
      'assignedTo',
      'departments'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

   
    await task.save();
if (req.body.description !== undefined) {
  await notifyTaskDescriptionUpdated(task, req.user);
}
if (global.io) {
  global.io.emit('taskUpdated', {
    taskId: task._id,
    updatedBy: req.user._id
  });
}

    

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'name domain')
      .populate('assignedTo', 'name email domain')
      .populate('assignedBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating task',
      error: error.message
    });
  }
};


//  Update task status (employees can update)
//  PATCH /api/tasks/:id/status
//  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is assigned to task
    const isAssigned = task.assignedTo.some(user => user.toString() === req.user.id);
    const isCreator = task.assignedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAssigned && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    task.status = status;

    if (status === 'completed') {
      task.completedAt = Date.now();
    }

    await task.save();

    // AUTO PROJECT STATUS UPDATE =====

const totalTasks = await Task.countDocuments({
  project: task.project
});

const completedTasks = await Task.countDocuments({
  project: task.project,
  status: "completed"
});

if (totalTasks > 0 && totalTasks === completedTasks) {
  await Project.findByIdAndUpdate(task.project, {
    status: "completed"
  });
} else {
  await Project.findByIdAndUpdate(task.project, {
    status: "active"
  });
}

    if (global.io) {
  global.io.emit('taskUpdated', {
    taskId: task._id,
    updatedBy: req.user._id
  });
}

    const updatedBy = await User.findById(req.user._id);

    if (status === 'completed') {
      // Notify task completion
      await notifyTaskCompleted(task, updatedBy);
    } else {
      // Notify status change
      await notifyTaskStatusUpdated(task, updatedBy, status);
    }
 res.status(200).json({
      success: true,
      message: `Task status updated to ${status}`,
      task
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating task status',
      error: error.message
    });
  }
};

//  Delete task
//  DELETE /api/tasks/:id
//  Private/Admin,Leader
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Only admin or task creator can delete
    if (req.user.role !== 'admin' && task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task',
      error: error.message
    });
  }
};

//  Get my tasks (for current user)
//  GET /api/tasks/my-tasks
//   Private
const getMyTasks = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'employee') {
      query.assignedTo = req.user.id;
    } else if (req.user.role === 'leader') {
      query.assignedBy = req.user.id;
    } else {
      // Admin sees all tasks
      query = {};
    }

    const tasks = await Task.find(query)
      .populate('project', 'name domain')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort('-createdAt');
console.log(tasks);
    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks',
      error: error.message
    });
  }
};

//   Add comment to task
//  POST /api/tasks/:id/comments
//  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.comments.push({
      user: req.user.id,
      text,
      createdAt: Date.now()
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('comments.user', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      comments: updatedTask.comments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment',
      error: error.message
    });
  }
};

module.exports = {
    createTask,
    getMyTasks,
    addComment,
    deleteTask,
    updateTaskStatus,
    updateTask,
    getTaskById,
    getAllTasks
}