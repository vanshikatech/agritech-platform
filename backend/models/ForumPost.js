const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorRole: {
      type: String,
      default: 'farmer',
    },
    comment: {
      type: String,
      required: true,
    },
    isExpertResponse: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const forumPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a topic title'],
      trim: true,
      maxlength: 160,
    },
    cropCategory: {
      type: String,
      default: 'General Agriculture',
      maxlength: 80,
    },
    question: {
      type: String,
      required: [true, 'Please write your question or observation'],
      maxlength: 5000,
    },
    tags: [String],
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Open', 'Under Review by Agronomist', 'Resolved'],
      default: 'Open',
    },
    moderationStatus: { type: String, enum: ['Visible', 'Hidden'], default: 'Visible' },
    reports: [{
      reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      reason: { type: String, required: true, maxlength: 500 },
      status: { type: String, enum: ['Open', 'Reviewed'], default: 'Open' },
      createdAt: { type: Date, default: Date.now },
    }],
    replies: [commentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ForumPost', forumPostSchema);
