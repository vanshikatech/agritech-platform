const express = require('express');
const router = express.Router();
const { getAdminMetrics, getAllUsers } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/metrics', getAdminMetrics);
router.get('/users', getAllUsers);

module.exports = router;
