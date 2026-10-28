const { sendControllerError } = require('../middleware/errorMiddleware');
const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const Product = require('../models/Product');
const WeatherPestAlert = require('../models/WeatherPestAlert');
const SoilReport = require('../models/SoilReport');
const ActivityLog = require('../models/ActivityLog');
const ForumPost = require('../models/ForumPost');

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
    const revenueResults = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResults[0]?.total || 0;

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
    return sendControllerError(res, error);
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
    return sendControllerError(res, error);
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['farmer', 'expert'].includes(role)) return res.status(400).json({ success: false, message: 'Role must be farmer or expert' });
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    const user = await User.findByIdAndUpdate(req.params.id, { $set: { role } }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: user });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 30));
    const [logs, total] = await Promise.all([
      ActivityLog.find().populate('actorId', 'name email role').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      ActivityLog.countDocuments(),
    ]);
    return res.json({ success: true, data: logs, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const getForumReports = async (req, res) => {
  try {
    const posts = await ForumPost.find({ 'reports.status': 'Open' })
      .populate('userId', 'name email')
      .populate('reports.reporterId', 'name email')
      .sort({ updatedAt: -1 });
    return res.json({ success: true, data: posts });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const moderateForumPost = async (req, res) => {
  try {
    const { moderationStatus } = req.body;
    if (!['Visible', 'Hidden'].includes(moderationStatus)) return res.status(400).json({ success: false, message: 'Moderation status must be Visible or Hidden' });
    const post = await ForumPost.findByIdAndUpdate(req.params.id, {
      $set: { moderationStatus, 'reports.$[].status': 'Reviewed' },
    }, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ success: false, message: 'Discussion post not found' });
    return res.json({ success: true, data: post });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

module.exports = {
  getAdminMetrics,
  getAllUsers,
  updateUserRole,
  getActivityLogs,
  getForumReports,
  moderateForumPost,
};
