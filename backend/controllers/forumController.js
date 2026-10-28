const { sendControllerError } = require('../middleware/errorMiddleware');
const ForumPost = require('../models/ForumPost');

// @desc    Get all forum discussions and consultations
// @route   GET /api/forum
// @access  Public / Private
const getPosts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.cropCategory = category;
    }

    if (search) {
      const escapedSearch = search.trim().slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { question: { $regex: escapedSearch, $options: 'i' } },
      ];
    }
    filter.moderationStatus = { $ne: 'Hidden' };

    const posts = await ForumPost.find(filter)
      .populate('userId', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/forum/:id
// @access  Public / Private
const getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate('userId', 'name role');
    if (!post) return res.status(404).json({ success: false, message: 'Discussion post not found' });
    if (post.moderationStatus === 'Hidden') return res.status(404).json({ success: false, message: 'Discussion post not found' });
    res.json({ success: true, data: post });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Create new discussion / expert consultation query
// @route   POST /api/forum
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, question, cropCategory, tags } = req.body;

    if (typeof title !== 'string' || typeof question !== 'string' || !title.trim() || !question.trim() || title.length > 160 || question.length > 5000) {
      return res.status(400).json({ success: false, message: 'Please provide both title and question' });
    }

    const post = await ForumPost.create({
      userId: req.user._id,
      authorName: req.user.name,
      title: title.trim(),
      question: question.trim(),
      cropCategory: cropCategory || 'General Agriculture',
      tags: tags || [],
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Reply to a post (community member or agronomist/expert)
// @route   POST /api/forum/:id/reply
// @access  Private
const addReply = async (req, res) => {
  try {
    const { comment } = req.body;
    if (typeof comment !== 'string' || !comment.trim() || comment.length > 5000) {
      return res.status(400).json({ success: false, message: 'Reply text cannot be empty' });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const newReply = {
      userId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      comment: comment.trim(),
      isExpertResponse: req.user.role === 'admin' || req.user.role === 'expert',
    };

    post.replies.push(newReply);
    if (newReply.isExpertResponse) {
      post.status = 'Resolved';
    }

    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Upvote a post
// @route   PUT /api/forum/:id/upvote
// @access  Private
const upvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const alreadyUpvoted = post.upvotedBy.some((id) => id.toString() === req.user._id.toString());

    if (alreadyUpvoted) {
      post.upvotes = Math.max(0, post.upvotes - 1);
      post.upvotedBy = post.upvotedBy.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.upvotes += 1;
      post.upvotedBy.push(req.user._id);
    }

    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const canManagePost = (post, user) => user.role === 'admin' || post.userId.toString() === user._id.toString();

const updatePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Discussion post not found' });
    if (!canManagePost(post, req.user)) return res.status(403).json({ success: false, message: 'Only the author or an admin may edit this post' });
    const { title, question, cropCategory, tags } = req.body;
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim() || title.length > 160) return res.status(400).json({ success: false, message: 'Title must contain 1 to 160 characters' });
      post.title = title.trim();
    }
    if (question !== undefined) {
      if (typeof question !== 'string' || !question.trim() || question.length > 5000) return res.status(400).json({ success: false, message: 'Question must contain 1 to 5000 characters' });
      post.question = question.trim();
    }
    if (cropCategory !== undefined) post.cropCategory = String(cropCategory).slice(0, 80);
    if (tags !== undefined) post.tags = Array.isArray(tags) ? tags.filter((tag) => typeof tag === 'string').slice(0, 10).map((tag) => tag.slice(0, 40)) : [];
    await post.save();
    return res.json({ success: true, data: post });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Discussion post not found' });
    if (!canManagePost(post, req.user)) return res.status(403).json({ success: false, message: 'Only the author or an admin may delete this post' });
    await post.deleteOne();
    return res.json({ success: true, message: 'Discussion post deleted' });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const reportPost = async (req, res) => {
  try {
    const reason = req.body.reason;
    if (typeof reason !== 'string' || !reason.trim() || reason.length > 500) return res.status(400).json({ success: false, message: 'Please provide a report reason (up to 500 characters)' });
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Discussion post not found' });
    if (post.userId.toString() === req.user._id.toString()) return res.status(400).json({ success: false, message: 'You cannot report your own post' });
    if (post.reports.some((report) => report.reporterId.toString() === req.user._id.toString() && report.status === 'Open')) return res.status(409).json({ success: false, message: 'You have already reported this post' });
    post.reports.push({ reporterId: req.user._id, reason: reason.trim() });
    await post.save();
    return res.status(201).json({ success: true, message: 'Report sent to moderators' });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  addReply,
  upvotePost,
  updatePost,
  deletePost,
  reportPost,
};
