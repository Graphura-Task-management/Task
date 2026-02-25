const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  verifyOTP,     //  ADD THIS
  resetPassword
} = require('../controllers/authController');

const { protect } = require('../middlewares/auth');

// ================= PUBLIC ROUTES =================
router.post('/register', register);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);      //  ADD THIS
router.post('/reset-password', resetPassword);

// ================= PROTECTED ROUTES =================
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;