const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');


router.use(protect);

// Get all notifications for current user
router.get('/', getNotifications);

// Get unread count
router.get('/unread/count', getUnreadCount);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Delete all read notifications
router.delete('/read', deleteAllRead);

// Mark specific notification as read
router.patch('/:id/read', markAsRead);

// Delete specific notification
router.delete('/:id', deleteNotification);

module.exports = router;