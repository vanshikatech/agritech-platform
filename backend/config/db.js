const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agritech_db');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️ Please ensure MongoDB is running locally, or configure a MongoDB Atlas URI in backend/.env');
    // If running in development without local Mongo, we don't necessarily want process to crash immediately
    // so API routes can return descriptive errors.
  }
};

module.exports = connectDB;
