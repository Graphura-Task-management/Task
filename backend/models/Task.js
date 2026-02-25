

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  // Multiple team members ko assign kar sakte hain
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  departments: [{
    type: String,
    enum: ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'UI/UX', 'QA/Testing', 'Data/Analytics', 'Database']
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'blocked'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  completedAt: {
    type: Date
  },
  // Comments/Discussion
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // File attachments (store file URLs)
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

// // Virtual for checking if task is overdue
// taskSchema.virtual('isOverdue').get(function() {
//   return this.status !== 'completed' && new Date() > this.dueDate;
// });

// // Ensure virtuals are included in JSON
// taskSchema.set('toJSON', { virtuals: true });
// taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);