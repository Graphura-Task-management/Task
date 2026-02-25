const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

//  Register new user
//  POST /api/auth/register
//  Public
const register = async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password, role, domain, accessKey} = req.body;
    let reportingTo;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Verify access key for admin and leader
    if (role === 'admin') {
      if (accessKey !== process.env.ADMIN_ACCESS_KEY) {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin access key'
        });
      }
    }

    if (role === 'leader') {
      if (accessKey !== process.env.LEADER_ACCESS_KEY) {
        return res.status(403).json({
          success: false,
          message: 'Invalid leader access key'
        });
      }
      if (!domain) {
        return res.status(400).json({
          success: false,
          message: 'Domain is required for leaders'
        });
      }
    }

    // Employee validation
    if (role === 'employee') {
      
      if (!domain) {
        return res.status(400).json({
          success: false,
          message: 'Domain required for employees'
        });
      }
//     const managers = await User.find({ 
//   domain, 
//   role: "leader" 
// });

// if (managers.length === 0) {
//   return res.status(404).json({
//     success: false,
//     message: `No leader found for ${domain} domain`
//   });
// }

// // Use first manager or implement selection logic
// reportingTo = managers[0]._id;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      domain: domain || undefined,
      accessKey: accessKey || undefined,
      reportingTo: reportingTo || undefined
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        domain: user.domain
      }
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

//  Login user
//  POST /api/auth/login
//  Public
const login = async (req, res) => {
  try {
    const { email, password, accessKey } = req.body;

    console.log("LOGIN BODY:", req.body);

    const user = await User.findOne({ email }).select('+password');

    console.log("USER FOUND:", user);
    console.log("DB ACCESS KEY:", user?.accessKey);
    console.log("INPUT ACCESS KEY:", accessKey);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Verify access key for admin and leader
    if (user.role === 'admin' || user.role === 'leader') {
      if (!accessKey || user.accessKey !== accessKey) {
        return res.status(403).json({
          success: false,
          message: 'Invalid access key'
        });
      }
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        domain: user.domain
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

//    Get current logged in user
//   GET /api/auth/me
// Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('reportingTo', 'name email role domain')
      .populate('assignedProjects', 'name description');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

//  Logout user
//  POST /api/auth/logout
//  Private
const logout = async (req, res) => {
  try {
    // Client-side will remove the token
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};


// @desc    Forgot Password (OTP Based)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email not registered'
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 min

    await user.save();

    await sendEmail(
      user.email,
      'Password Reset OTP',
      `<h2>Password Reset OTP</h2>
       <h1>${otp}</h1>
       <p>This OTP expires in 5 minutes.</p>`
    );

    res.status(200).json({
      success: true,
      message: 'OTP sent to email'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending OTP'
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying OTP"
    });
  }
};

// @desc    Reset Password (OTP Based)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    user.password = password;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resetting password"
    });
  }
};
module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
   verifyOTP,
  resetPassword
};