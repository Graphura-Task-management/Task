

const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getMyTasks,
  addComment,
  updateTaskStatus
} = require('../controllers/taskController');
const { protect, authorize , canAssignTask ,} = require('../middlewares/auth');

// Protect all routes
router.use(protect);

// Get tasks based on role
router.get('/my-tasks', getMyTasks);
router.get('/', getAllTasks);

// Task CRUD
router.post('/', authorize('admin', 'leader'), canAssignTask, createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', authorize('admin', 'leader'), deleteTask);

// Task status update (employees can update their tasks)
router.patch('/:id/status', updateTaskStatus);

// Comments
router.post('/:id/comments', addComment);

module.exports = router;