const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  addReply,
  upvotePost,
  updatePost,
  deletePost,
  reportPost,
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', protect, createPost);
router.post('/:id/reply', protect, addReply);
router.put('/:id/upvote', protect, upvotePost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/report', protect, reportPost);

module.exports = router;
