const { sendControllerError } = require('../middleware/errorMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user (farmer or admin)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, language, location } = req.body;

    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (name.trim().length > 80 || normalizedEmail.length > 254) {
      return res.status(400).json({ success: false, message: 'Name or email is too long' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must contain at least 8 characters' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'farmer',
      phone: phone || '',
      language: language || 'en',
      location: location || { state: 'Maharashtra', district: 'Pune', village: '' },
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
        location: user.location,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          language: user.language,
          location: user.location,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Update user profile or language
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.name !== undefined) {
        if (typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.trim().length > 80) {
          return res.status(400).json({ success: false, message: 'Name must contain 1 to 80 characters' });
        }
        user.name = req.body.name.trim();
      }
      if (req.body.phone !== undefined) {
        if (typeof req.body.phone !== 'string' || req.body.phone.length > 24) return res.status(400).json({ success: false, message: 'Phone must be at most 24 characters' });
        user.phone = req.body.phone.trim();
      }
      if (req.body.language !== undefined) {
        if (!['en', 'hi', 'te', 'mr', 'ta'].includes(req.body.language)) return res.status(400).json({ success: false, message: 'Unsupported language selection' });
        user.language = req.body.language;
      }
      if (req.body.location) {
        const location = req.body.location;
        if (typeof location !== 'object' || Array.isArray(location)) return res.status(400).json({ success: false, message: 'Location must be an object' });
        for (const field of ['state', 'district', 'village']) {
          if (location[field] !== undefined) {
            if (typeof location[field] !== 'string' || location[field].length > 80) return res.status(400).json({ success: false, message: `${field} must be at most 80 characters` });
            user.location[field] = location[field].trim();
          }
        }
      }
      if (req.body.password) {
        if (typeof req.body.password !== 'string' || req.body.password.length < 8 || req.body.password.length > 128) {
          return res.status(400).json({ success: false, message: 'New password must contain 8 to 128 characters' });
        }
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          language: updatedUser.language,
          location: updatedUser.location,
          token: generateToken(updatedUser._id),
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    return sendControllerError(res, error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
