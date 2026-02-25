const express = require('express');
const router = express.Router();
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  addTeamMember,
  removeTeamMember
} = require('../controllers/projectController');
const { protect, authorize ,canManageProject} = require('../middlewares/auth');

// Protect all routes
router.use(protect);

// Get projects based on role
router.get('/my-projects', getMyProjects);

// Admin only routes
router.post('/', authorize('admin'), createProject);
router.get('/', authorize('admin', 'leader'), getAllProjects);

// Project management
router.get('/:id', getProjectById);
router.put('/:id', authorize('admin', 'leader'), canManageProject, updateProject);
router.delete('/:id', authorize('admin'), deleteProject);

// Team management
// router.post('/:id/team/add', authorize('admin', 'leader'), canManageProject, addTeamMember);
// router.post('/:id/team/remove', authorize('admin', 'leader'), canManageProject, removeTeamMember);

module.exports = router;
