const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String, required: true, maxlength: 140 },
  method: { type: String, required: true, enum: ['POST', 'PUT', 'PATCH', 'DELETE'] },
  statusCode: { type: Number, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
