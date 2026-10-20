const express = require('express');
const router = express.Router();
const { getSoilReports, createSoilReport, previewSoilAnalysis } = require('../controllers/soilController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', previewSoilAnalysis); // Public or private algorithm preview

router.use(protect);
router.route('/')
  .get(getSoilReports)
  .post(createSoilReport);

module.exports = router;
