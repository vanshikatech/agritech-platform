const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  addReply,
  upvotePost,
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', protect, createPost);
router.post('/:id/reply', protect, addReply);
router.put('/:id/upvote', protect, upvotePost);

module.exports = router;
