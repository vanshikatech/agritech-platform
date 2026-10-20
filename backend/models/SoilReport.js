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
    },
    phosphorusKgHa: {
      type: Number,
      required: [true, 'Phosphorus (P) value is required'],
    },
    potassiumKgHa: {
      type: Number,
      required: [true, 'Potassium (K) value is required'],
    },
    organicCarbonPercent: {
      type: Number,
      default: 0.5,
    },
    moisturePercent: {
      type: Number,
      default: 45,
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
