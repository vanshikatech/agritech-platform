const Crop = require('../models/Crop');
const Farm = require('../models/Farm');

// @desc    Get all crops for user (optionally filter by farmId)
// @route   GET /api/crops
// @access  Private
const getCrops = async (req, res) => {
  try {
    const { farmId } = req.query;
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };

    if (farmId) {
      filter.farmId = farmId;
    }

    const crops = await Crop.find(filter).populate('farmId', 'farmName location').sort({ createdAt: -1 });
    res.json({ success: true, count: crops.length, data: crops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single crop by ID
// @route   GET /api/crops/:id
// @access  Private
const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farmId', 'farmName location soilType');
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop record not found' });
    }

    if (req.user.role !== 'admin' && crop.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this crop' });
    }

    res.json({ success: true, data: crop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new crop to a farm
// @route   POST /api/crops
// @access  Private
const createCrop = async (req, res) => {
  try {
    const { farmId, cropName, variety, areaCultivatedAcres, sowingDate, expectedHarvestDate, growthStage, healthStatus, notes } = req.body;

    if (!farmId || !cropName || !sowingDate || !expectedHarvestDate) {
      return res.status(400).json({ success: false, message: 'Please provide farmId, cropName, sowingDate, and expectedHarvestDate' });
    }

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Referenced farm not found' });
    }

    if (req.user.role !== 'admin' && farm.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to add crop to this farm' });
    }

    const crop = await Crop.create({
      userId: req.user._id,
      farmId,
      cropName,
      variety: variety || 'Standard',
      areaCultivatedAcres: areaCultivatedAcres || 1,
      sowingDate,
      expectedHarvestDate,
      growthStage: growthStage || 'Sowing',
      healthStatus: healthStatus || 'Healthy',
      notes: notes || '',
    });

    res.status(201).json({ success: true, data: crop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update crop (stage, health, notes)
// @route   PUT /api/crops/:id
// @access  Private
const updateCrop = async (req, res) => {
  try {
    let crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop record not found' });
    }

    if (req.user.role !== 'admin' && crop.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this crop' });
    }

    crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: crop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete crop
// @route   DELETE /api/crops/:id
// @access  Private
const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop record not found' });
    }

    if (req.user.role !== 'admin' && crop.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this crop' });
    }

    await crop.deleteOne();
    res.json({ success: true, message: 'Crop record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
};
