const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiRateLimit } = require('./middleware/rateLimitMiddleware');
const activityLogger = require('./middleware/activityLogger');

// Load environment variables
dotenv.config();

const app = express();
app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);
app.disable('x-powered-by');

// Middlewares
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map((origin) => origin.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use('/api', apiRateLimit);
app.use('/api', activityLogger);

// Request logger middleware (Requirement: Slide 7 - Monitoring & Logging)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'online' : 'database unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
    project: 'AgriTech - Empowering Farmers Through Digital Technology',
    timestamp: new Date(),
    version: '1.0.0',
  });
});

// Mount API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/farms', require('./routes/farmRoutes'));
app.use('/api/crops', require('./routes/cropRoutes'));
app.use('/api/soil', require('./routes/soilRoutes'));
app.use('/api/weather', require('./routes/weatherAlertRoutes'));
const resourceOrderRoutes = require('./routes/resourceOrderRoutes');
app.use('/api/resources', resourceOrderRoutes.resourcesRouter);
app.use('/api/orders', resourceOrderRoutes.ordersRouter);
app.use('/api/forum', require('./routes/forumRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 & Centralized Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET === 'replace_with_a_random_secret_of_at_least_32_characters') {
    throw new Error('Set JWT_SECRET to a unique random value of at least 32 characters in backend/.env.');
  }
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🌾 AgriTech API Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
};

start().catch((error) => {
  console.error(`❌ API startup failed: ${error.message}`);
  process.exit(1);
});
