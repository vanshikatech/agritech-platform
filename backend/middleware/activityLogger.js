const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');

const activityLogger = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

  res.on('finish', () => {
    let actorId = null;
    const authorization = req.headers.authorization || '';
    if (process.env.JWT_SECRET && authorization.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
        if (mongoose.isValidObjectId(decoded.id)) actorId = decoded.id;
      } catch { /* The log records the action as unauthenticated when a token is invalid. */ }
    }
    const action = `${req.method} ${req.originalUrl.split('?')[0]}`.slice(0, 140);
    ActivityLog.create({ actorId, action, method: req.method, statusCode: res.statusCode })
      .catch((error) => console.error('Could not write activity log:', error.message));
  });
  return next();
};

module.exports = activityLogger;
