
const express = require('express');
const router = express.Router();
const {
 getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getLeaders,
  getEmployees,
  getTeamMembers,
  getAdminDashboardStats,
  getLeaderDetails

} = require('../controllers/userController');
const { protect, authorize, canManageProject } = require('../middlewares/auth');
const { addTeamMember, removeTeamMember } = require('../controllers/projectController');

// Protect all routes
router.use(protect);

// Admin Dashboard Stats
router.get('/dashboard/stats', authorize('admin'), getAdminDashboardStats);

// Get users
router.get('/', authorize('admin'), getAllUsers);
router.get('/leaders', authorize('admin'), getLeaders);
router.get('/leaders/:id/details', authorize('admin'), getLeaderDetails);
router.get('/employees', authorize('admin', 'leader'), getEmployees);
router.get('/my-team', authorize('leader'), getTeamMembers);

router.post('/team/add' , authorize('admin' , 'leader') , addTeamMember);
router.post('/team/remove', authorize('admin', 'leader'), removeTeamMember);


// User management
router.get('/:id', getUserById);
router.put('/updateProfile', authorize('admin' , 'leader' , 'employee'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;