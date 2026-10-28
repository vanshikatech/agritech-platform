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
      maxlength: 100,
    },
    variety: {
      type: String,
      default: 'Standard Hybrid',
      maxlength: 100,
    },
    areaCultivatedAcres: {
      type: Number,
      default: 1,
      min: 0.01,
      max: 1000000,
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
      min: 0,
      max: 1000000000,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Crop', cropSchema);
