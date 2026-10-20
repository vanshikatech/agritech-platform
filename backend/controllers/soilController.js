const SoilReport = require('../models/SoilReport');
const Farm = require('../models/Farm');
const { analyzeSoilHealth } = require('../utils/soilAdvisor');

// @desc    Get all soil reports for user or farm
// @route   GET /api/soil
// @access  Private
const getSoilReports = async (req, res) => {
  try {
    const { farmId } = req.query;
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    if (farmId) filter.farmId = farmId;

    const reports = await SoilReport.find(filter)
      .populate('farmId', 'farmName location soilType')
      .sort({ testedAt: -1 });

    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new soil test report with automated recommendations
// @route   POST /api/soil
// @access  Private
const createSoilReport = async (req, res) => {
  try {
    const { farmId, sampleName, phLevel, nitrogenKgHa, phosphorusKgHa, potassiumKgHa, organicCarbonPercent, moisturePercent } = req.body;

    if (!farmId || phLevel === undefined || nitrogenKgHa === undefined || phosphorusKgHa === undefined || potassiumKgHa === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide farmId, phLevel, nitrogenKgHa, phosphorusKgHa, and potassiumKgHa',
      });
    }

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm profile not found' });
    }

    if (req.user.role !== 'admin' && farm.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this farm profile' });
    }

    // Run expert agronomic advisory algorithm
    const analysis = analyzeSoilHealth({
      phLevel: Number(phLevel),
      nitrogenKgHa: Number(nitrogenKgHa),
      phosphorusKgHa: Number(phosphorusKgHa),
      potassiumKgHa: Number(potassiumKgHa),
      moisturePercent: Number(moisturePercent || 40),
    });

    const soilReport = await SoilReport.create({
      userId: req.user._id,
      farmId,
      sampleName: sampleName || 'Field Soil Sample',
      phLevel: Number(phLevel),
      nitrogenKgHa: Number(nitrogenKgHa),
      phosphorusKgHa: Number(phosphorusKgHa),
      potassiumKgHa: Number(potassiumKgHa),
      organicCarbonPercent: Number(organicCarbonPercent || 0.6),
      moisturePercent: Number(moisturePercent || 40),
      healthGrade: analysis.healthGrade,
      recommendations: analysis.recommendations,
    });

    res.status(201).json({ success: true, data: soilReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Instant preview analysis without saving
// @route   POST /api/soil/analyze
// @access  Private
const previewSoilAnalysis = async (req, res) => {
  try {
    const { phLevel, nitrogenKgHa, phosphorusKgHa, potassiumKgHa, moisturePercent } = req.body;
    const analysis = analyzeSoilHealth({
      phLevel: Number(phLevel || 7.0),
      nitrogenKgHa: Number(nitrogenKgHa || 300),
      phosphorusKgHa: Number(phosphorusKgHa || 15),
      potassiumKgHa: Number(potassiumKgHa || 150),
      moisturePercent: Number(moisturePercent || 40),
    });
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSoilReports,
  createSoilReport,
  previewSoilAnalysis,
};
