const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const Product = require('../models/Product');
const WeatherPestAlert = require('../models/WeatherPestAlert');
const SoilReport = require('../models/SoilReport');

// @desc    Get Admin Metrics and Overview
// @route   GET /api/admin/metrics
// @access  Private / Admin
const getAdminMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalFarms = await Farm.countDocuments();
    const totalCrops = await Crop.countDocuments();
    const totalSoilReports = await SoilReport.countDocuments();
    const totalOrders = await Order.countDocuments();
    const activeAlerts = await WeatherPestAlert.countDocuments({ isActive: true });

    // Calculate total order revenue
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalFarmers,
        totalFarms,
        totalCrops,
        totalSoilReports,
        totalOrders,
        totalRevenue,
        activeAlerts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private / Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminMetrics,
  getAllUsers,
};
