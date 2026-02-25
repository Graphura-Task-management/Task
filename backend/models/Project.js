const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
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
      required: [true, 'Domain is required'],
    },

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project leader is required'],
    },

    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },

    status: {
      type: String,
      enum: ['active', 'completed', 'on-hold', 'cancelled'],
      default: 'active',
    },

    // Team members
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
projectSchema.index({ leader: 1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);
