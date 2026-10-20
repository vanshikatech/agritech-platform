const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmName: {
      type: String,
      required: [true, 'Please provide farm name'],
      trim: true,
    },
    totalAreaAcres: {
      type: Number,
      required: [true, 'Please provide total farm area in acres'],
      min: [0.1, 'Farm area must be greater than 0'],
    },
    soilType: {
      type: String,
      enum: ['Alluvial', 'Black Soil', 'Red Soil', 'Laterite', 'Sandy Loam', 'Clay'],
      default: 'Black Soil',
    },
    irrigationType: {
      type: String,
      enum: ['Drip Irrigation', 'Sprinkler', 'Canal', 'Rainfed', 'Borewell'],
      default: 'Drip Irrigation',
    },
    location: {
      state: { type: String, default: 'Maharashtra' },
      district: { type: String, default: 'Pune' },
      village: { type: String, default: '' },
      pincode: { type: String, default: '' },
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

module.exports = mongoose.model('Farm', farmSchema);
