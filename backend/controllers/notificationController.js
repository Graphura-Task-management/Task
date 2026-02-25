const Notification = require('../models/Notification');
const User = require('../models/User');


const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Get all notifications for current user
 * @route GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const { limit = 10, skip = 0, read } = req.query;

    const query = { user: req.user._id };
    
    // Filter by read status if provided
    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('relatedUser', 'name email')
      .populate('relatedTask', 'title')
      .populate('relatedProject', 'name');

    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        total: totalCount,
        unreadCount,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications',
      error: error.message
    });
  }
};

/**
 * Get unread notification count
 * @route GET /api/notifications/unread/count
 */
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 * @route PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });

  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read
 * @route PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Delete notification
 * @route DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Delete all read notifications
 * @route DELETE /api/notifications/read
 */
const deleteAllRead = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      user: req.user._id,
      read: true
    });

    res.status(200).json({
      success: true,
      message: 'All read notifications deleted',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// HELPER FUNCTIONS TO CREATE NOTIFICATIONS



//   Notify when task is assigned

const notifyTaskAssigned = async (task, assignedToIds) => {
  try {
    const notifications = assignedToIds.map(userId => ({
      user: userId,
      type: 'task_assigned',
      message: `You have been assigned a new task: "${task.title}"`,
      relatedTask: task._id,
      relatedProject: task.project,
      relatedUser: task.assignedBy
    }));

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} task assignment notifications`);
  } catch (error) {
    console.error('Error creating task assignment notifications:', error);
  }
};

/**
 * Notify when task status is updated
 */
const notifyTaskStatusUpdated = async (task, updatedBy, newStatus) => {
  try {
    // Notify the task assigner (leader)
    const notification = {
      user: task.assignedBy,
      type: 'task_status_updated',
      message: `Task "${task.title}" status updated to ${newStatus} by ${updatedBy.name}`,
      relatedTask: task._id,
      relatedProject: task.project,
      relatedUser: updatedBy._id
    };

    await Notification.create(notification);
    console.log('Created task status update notification');
  } catch (error) {
    console.error('Error creating task status notification:', error);
  }
};

/**
 * Notify when task is completed
 */
const notifyTaskCompleted = async (task, completedBy) => {
  try {
    const notification = {
      user: task.assignedBy,
      type: 'task_completed',
      message: `Task "${task.title}" has been completed by ${completedBy.name}`,
      relatedTask: task._id,
      relatedProject: task.project,
      relatedUser: completedBy._id
    };

    await Notification.create(notification);
    console.log('Created task completion notification');
  } catch (error) {
    console.error('Error creating task completion notification:', error);
  }
};

/**
 * Notify when added to project
 */
const notifyProjectAssigned = async (project, memberId, assignedBy) => {
  try {
    const notification = {
      user: memberId,
      type: 'project_assigned',
      message: `You have been added to project "${project.name}" by ${assignedBy.name}`,
      relatedProject: project._id,
      relatedUser: assignedBy._id
    };

    await Notification.create(notification);
    console.log('Created project assignment notification');
  } catch (error) {
    console.error('Error creating project assignment notification:', error);
  }
};

/**
 * Notify when task description is updated
 */
const notifyTaskDescriptionUpdated = async (task, updatedBy) => {
  try {
    const assignedUsers = task.assignedTo;

    const notifications = assignedUsers
      .filter(userId => userId.toString() !== updatedBy._id.toString())
      .map(userId => ({
        user: userId,
        type: 'task_updated',
        message: `Task "${task.title}" description has been updated`,
        relatedTask: task._id,
        relatedProject: task.project,
        relatedUser: updatedBy._id
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} description update notifications`);
    }

  } catch (error) {
    console.error('Error creating description update notifications:', error);
  }
};

module.exports = {
  // API Controllers
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  
  // Helper functions for other controllers
  createNotification,
  notifyTaskAssigned,
  notifyTaskStatusUpdated,
  notifyTaskCompleted,
  notifyProjectAssigned,
  notifyTaskDescriptionUpdated
};