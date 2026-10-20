const express = require('express');
const router = express.Router();
const {
  getWeatherForecast,
  getPestAlerts,
  createPestAlert,
  updatePestAlert,
} = require('../controllers/weatherAlertController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/forecast', getWeatherForecast);
router.get('/pest-alerts', getPestAlerts);

// Admin-only endpoints for alert broadcasting
router.post('/pest-alerts', protect, adminOnly, createPestAlert);
router.put('/pest-alerts/:id', protect, adminOnly, updatePestAlert);

module.exports = router;
