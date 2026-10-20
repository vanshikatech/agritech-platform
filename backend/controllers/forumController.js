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
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { question: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await ForumPost.find(filter)
      .populate('userId', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/forum/:id
// @access  Public / Private
const getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate('userId', 'name role');
    if (!post) return res.status(404).json({ success: false, message: 'Discussion post not found' });
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new discussion / expert consultation query
// @route   POST /api/forum
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, question, cropCategory, tags } = req.body;

    if (!title || !question) {
      return res.status(400).json({ success: false, message: 'Please provide both title and question' });
    }

    const post = await ForumPost.create({
      userId: req.user._id,
      authorName: req.user.name,
      title,
      question,
      cropCategory: cropCategory || 'General Agriculture',
      tags: tags || [],
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply to a post (community member or agronomist/expert)
// @route   POST /api/forum/:id/reply
// @access  Private
const addReply = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
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
      comment,
      isExpertResponse: req.user.role === 'admin' || req.user.role === 'expert',
    };

    post.replies.push(newReply);
    if (newReply.isExpertResponse) {
      post.status = 'Resolved';
    }

    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upvote a post
// @route   PUT /api/forum/:id/upvote
// @access  Private
const upvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const alreadyUpvoted = post.upvotedBy.includes(req.user._id);

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
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  addReply,
  upvotePost,
};
