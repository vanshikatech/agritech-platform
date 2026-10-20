const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const SoilReport = require('../models/SoilReport');

// @desc    Get all farms for logged-in user
// @route   GET /api/farms
// @access  Private
const getFarms = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const farms = await Farm.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: farms.length, data: farms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single farm details with linked crops & soil records
// @route   GET /api/farms/:id
// @access  Private
const getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm profile not found' });
    }

    if (req.user.role !== 'admin' && farm.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this farm profile' });
    }

    const crops = await Crop.find({ farmId: farm._id });
    const soilReports = await SoilReport.find({ farmId: farm._id }).sort({ testedAt: -1 });

    res.json({
      success: true,
      data: {
        farm,
        crops,
        soilReports,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new farm profile
// @route   POST /api/farms
// @access  Private
const createFarm = async (req, res) => {
  try {
    const { farmName, totalAreaAcres, soilType, irrigationType, location, notes } = req.body;

    if (!farmName || !totalAreaAcres) {
      return res.status(400).json({ success: false, message: 'Please provide farm name and area in acres' });
    }

    const farm = await Farm.create({
      userId: req.user._id,
      farmName,
      totalAreaAcres,
      soilType: soilType || 'Black Soil',
      irrigationType: irrigationType || 'Drip Irrigation',
      location: location || req.user.location,
      notes: notes || '',
    });

    res.status(201).json({ success: true, data: farm });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update farm profile
// @route   PUT /api/farms/:id
// @access  Private
const updateFarm = async (req, res) => {
  try {
    let farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm profile not found' });
    }

    if (req.user.role !== 'admin' && farm.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this farm profile' });
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: farm });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete farm profile
// @route   DELETE /api/farms/:id
// @access  Private
const deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm profile not found' });
    }

    if (req.user.role !== 'admin' && farm.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this farm profile' });
    }

    // Cascade delete associated crops & soil reports
    await Crop.deleteMany({ farmId: farm._id });
    await SoilReport.deleteMany({ farmId: farm._id });
    await farm.deleteOne();

    res.json({ success: true, message: 'Farm and associated records removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
};
