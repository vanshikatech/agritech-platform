const express = require('express');
const router = express.Router();
const { getAdminMetrics, getAllUsers, updateUserRole, getActivityLogs, getForumReports, moderateForumPost } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/metrics', getAdminMetrics);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/activity', getActivityLogs);
router.get('/forum/reports', getForumReports);
router.patch('/forum/:id/moderation', moderateForumPost);

module.exports = router;
