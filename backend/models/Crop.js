const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
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
    cropName: {
      type: String,
      required: [true, 'Please specify crop name'],
      trim: true,
    },
    variety: {
      type: String,
      default: 'Standard Hybrid',
    },
    areaCultivatedAcres: {
      type: Number,
      default: 1,
    },
    sowingDate: {
      type: Date,
      required: [true, 'Please provide sowing date'],
    },
    expectedHarvestDate: {
      type: Date,
      required: [true, 'Please provide expected harvest date'],
    },
    growthStage: {
      type: String,
      enum: ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Maturity', 'Harvesting'],
      default: 'Sowing',
    },
    healthStatus: {
      type: String,
      enum: ['Excellent', 'Healthy', 'Moderate', 'At Risk', 'Pest Attack'],
      default: 'Healthy',
    },
    expectedYieldKg: {
      type: Number,
      default: 1000,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Crop', cropSchema);
