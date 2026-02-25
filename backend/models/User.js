const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },

    profilePhoto: {
      url: String,
      filename: String,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ['admin', 'leader', 'employee'],
      default: 'employee',
    },

    domain: {
      type: String,
      enum: [
        'Sales & Marketing',
        'Data & AI Intelligence',
        'Human Resources',
        'Social Media Management',
        'Graphic Design',
        'Digital Marketing',
        'Video Editing',
        'Full Stack Development',
        'MERN Stack Development',
        'Email and Outreaching',
        'Content Writing',
        'Content Creator',
        'UI/UX Designing',
        'Front-end Developer',
        'Back-end Developer',
      ],
      required: function () {
        return this.role === 'employee' || this.role === 'leader';
      },
    },

    accessKey: {
      type: String,
      required: function () {
        return this.role === 'admin' || this.role === 'leader';
      },
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    // Employee kis leader ko report karega
    reportingTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Leader ke assigned projects
    assignedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    
   // OTP fields (FOR PASSWORD RESET)
   otp: {
    type: String,
},

   otpExpire: {
     type: Date,
},

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hide password in response
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
