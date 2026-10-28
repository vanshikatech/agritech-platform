const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      enum: ['Seeds', 'Fertilizers', 'Organic Pesticides', 'Irrigation Tools', 'Farm Equipment'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: 100000000,
    },
    unit: {
      type: String,
      default: 'kg', // e.g., '50 kg bag', '1 Liter bottle', 'piece'
      maxlength: 60,
    },
    stock: {
      type: Number,
      required: true,
      default: 100,
      min: 0,
      max: 100000000,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=500&auto=format&fit=crop&q=60',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
