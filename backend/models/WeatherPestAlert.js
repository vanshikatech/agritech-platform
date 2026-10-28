const mongoose = require('mongoose');

const weatherPestAlertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    alertType: {
      type: String,
      enum: ['Weather Warning', 'Pest Outbreak', 'Fungal Infection', 'Harvest Advisory'],
      default: 'Pest Outbreak',
    },
    severity: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      default: 'Moderate',
    },
    region: {
      state: { type: String, default: 'Maharashtra' },
      district: { type: String, default: 'Pune' },
    },
    affectedCrops: [
      {
        type: String,
      },
    ],
    symptoms: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    preventiveAction: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    recommendedPesticideOrRemedy: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validUntil: {
      type: Date,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), // 7 days ahead
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WeatherPestAlert', weatherPestAlertSchema);
