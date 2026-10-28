const mongoose = require('mongoose');

const soilReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    sampleName: {
      type: String,
      default: 'Main Plot Sample',
      trim: true,
      maxlength: 100,
    },
    phLevel: {
      type: Number,
      required: [true, 'pH Level is required'],
      min: 0,
      max: 14,
    },
    nitrogenKgHa: {
      type: Number,
      required: [true, 'Nitrogen (N) value is required'],
      min: 0,
      max: 10000,
    },
    phosphorusKgHa: {
      type: Number,
      required: [true, 'Phosphorus (P) value is required'],
      min: 0,
      max: 10000,
    },
    potassiumKgHa: {
      type: Number,
      required: [true, 'Potassium (K) value is required'],
      min: 0,
      max: 10000,
    },
    organicCarbonPercent: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 100,
    },
    moisturePercent: {
      type: Number,
      default: 45,
      min: 0,
      max: 100,
    },
    healthGrade: {
      type: String,
      enum: ['Optimal', 'Deficient', 'Acidic', 'Alkaline', 'Critical'],
      default: 'Optimal',
    },
    recommendations: [
      {
        type: String,
      },
    ],
    testedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SoilReport', soilReportSchema);
