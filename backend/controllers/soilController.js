const { sendControllerError } = require('../middleware/errorMiddleware');
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
    return sendControllerError(res, error);
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
    const values = validateSoilValues({ phLevel, nitrogenKgHa, phosphorusKgHa, potassiumKgHa, moisturePercent, organicCarbonPercent });
    const analysis = analyzeSoilHealth(values);

    if (sampleName !== undefined && (typeof sampleName !== 'string' || sampleName.trim().length > 100)) {
      return res.status(400).json({ success: false, message: 'Sample name must be at most 100 characters' });
    }

    const soilReport = await SoilReport.create({
      userId: req.user._id,
      farmId,
      sampleName: sampleName || 'Field Soil Sample',
      ...values,
      healthGrade: analysis.healthGrade,
      recommendations: analysis.recommendations,
    });

    res.status(201).json({ success: true, data: soilReport });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const validateSoilValues = (input) => {
  const limits = {
    phLevel: [0, 14],
    nitrogenKgHa: [0, 10000],
    phosphorusKgHa: [0, 10000],
    potassiumKgHa: [0, 10000],
    organicCarbonPercent: [0, 100],
    moisturePercent: [0, 100],
  };
  const values = {};
  for (const [key, [min, max]] of Object.entries(limits)) {
    const raw = input[key];
    if (raw === undefined && ['organicCarbonPercent', 'moisturePercent'].includes(key)) {
      values[key] = key === 'organicCarbonPercent' ? 0.6 : 40;
      continue;
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || value < min || value > max) {
      const error = new Error(`${key} must be a number between ${min} and ${max}`);
      error.statusCode = 400;
      throw error;
    }
    values[key] = value;
  }
  return values;
};

const canAccessReport = (report, user) => user.role === 'admin' || report.userId.toString() === user._id.toString();

const updateSoilReport = async (req, res) => {
  try {
    const report = await SoilReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Soil report not found' });
    if (!canAccessReport(report, req.user)) return res.status(403).json({ success: false, message: 'Not authorized to edit this report' });

    const fields = ['sampleName', 'phLevel', 'nitrogenKgHa', 'phosphorusKgHa', 'potassiumKgHa', 'organicCarbonPercent', 'moisturePercent'];
    const values = validateSoilValues({ ...report.toObject(), ...Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]])) });
    const analysis = analyzeSoilHealth(values);
    Object.assign(report, values, { healthGrade: analysis.healthGrade, recommendations: analysis.recommendations });
    if (req.body.sampleName !== undefined) {
      if (typeof req.body.sampleName !== 'string' || req.body.sampleName.trim().length > 100) return res.status(400).json({ success: false, message: 'Sample name must be at most 100 characters' });
      report.sampleName = req.body.sampleName.trim();
    }
    await report.save();
    return res.json({ success: true, data: report });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const deleteSoilReport = async (req, res) => {
  try {
    const report = await SoilReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Soil report not found' });
    if (!canAccessReport(report, req.user)) return res.status(403).json({ success: false, message: 'Not authorized to delete this report' });
    await report.deleteOne();
    return res.json({ success: true, message: 'Soil report deleted' });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Instant preview analysis without saving
// @route   POST /api/soil/analyze
// @access  Private
const previewSoilAnalysis = async (req, res) => {
  try {
    const { phLevel, nitrogenKgHa, phosphorusKgHa, potassiumKgHa, moisturePercent } = req.body;
    const analysis = analyzeSoilHealth(validateSoilValues({
      phLevel: phLevel === undefined ? 7 : phLevel,
      nitrogenKgHa: nitrogenKgHa === undefined ? 300 : nitrogenKgHa,
      phosphorusKgHa: phosphorusKgHa === undefined ? 15 : phosphorusKgHa,
      potassiumKgHa: potassiumKgHa === undefined ? 150 : potassiumKgHa,
      moisturePercent: moisturePercent === undefined ? 40 : moisturePercent,
    }));
    res.json({ success: true, data: analysis });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

module.exports = {
  getSoilReports,
  createSoilReport,
  updateSoilReport,
  deleteSoilReport,
  previewSoilAnalysis,
};
