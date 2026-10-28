const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authRateLimit } = require('../middleware/rateLimitMiddleware');

router.post('/register', authRateLimit, registerUser);
router.post('/login', authRateLimit, loginUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

module.exports = router;
