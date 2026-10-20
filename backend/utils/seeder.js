const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const SoilReport = require('../models/SoilReport');
const WeatherPestAlert = require('../models/WeatherPestAlert');
const Product = require('../models/Product');
const ForumPost = require('../models/ForumPost');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agritech_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Farm.deleteMany();
    await Crop.deleteMany();
    await SoilReport.deleteMany();
    await WeatherPestAlert.deleteMany();
    await Product.deleteMany();
    await ForumPost.deleteMany();

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const farmerPassword = await bcrypt.hash('farmer123', salt);

    const admin = await User.create({
      name: 'Dr. Ramesh Sharma (Admin & Agronomist)',
      email: 'admin@agritech.com',
      password: adminPassword,
      role: 'admin',
      phone: '+91 9876543210',
      language: 'en',
      location: { state: 'Maharashtra', district: 'Pune', village: 'Baramati' },
    });

    const farmer = await User.create({
      name: 'Suresh Patil',
      email: 'farmer@agritech.com',
      password: farmerPassword,
      role: 'farmer',
      phone: '+91 9123456780',
      language: 'hi',
      location: { state: 'Maharashtra', district: 'Pune', village: 'Shivaji Nagar' },
    });

    // 2. Seed Farm
    const farm = await Farm.create({
      userId: farmer._id,
      farmName: 'Patil Green Harvest Farm',
      totalAreaAcres: 6.5,
      soilType: 'Black Soil',
      irrigationType: 'Drip Irrigation',
      location: { state: 'Maharashtra', district: 'Pune', village: 'Baramati', pincode: '413102' },
      notes: 'Organic farming practice with micro-sprinklers for intercropping.',
    });

    // 3. Seed Crops
    await Crop.create([
      {
        userId: farmer._id,
        farmId: farm._id,
        cropName: 'Wheat (Gehun)',
        variety: 'Sharbati HD-2967',
        areaCultivatedAcres: 3.5,
        sowingDate: new Date('2026-10-01'),
        expectedHarvestDate: new Date('2027-02-15'),
        growthStage: 'Vegetative',
        healthStatus: 'Healthy',
        expectedYieldKg: 4200,
        notes: 'First top dressing with neem-coated urea done on Day 21.',
      },
      {
        userId: farmer._id,
        farmId: farm._id,
        cropName: 'Tomato',
        variety: 'Abhinav Hybrid F1',
        areaCultivatedAcres: 2.0,
        sowingDate: new Date('2026-09-15'),
        expectedHarvestDate: new Date('2026-12-20'),
        growthStage: 'Flowering',
        healthStatus: 'Moderate',
        expectedYieldKg: 6500,
        notes: 'Monitoring for early blight signs; staking completed.',
      },
      {
        userId: farmer._id,
        farmId: farm._id,
        cropName: 'Gram (Chana)',
        variety: 'Vijay Desi',
        areaCultivatedAcres: 1.0,
        sowingDate: new Date('2026-10-10'),
        expectedHarvestDate: new Date('2027-01-25'),
        growthStage: 'Germination',
        healthStatus: 'Excellent',
        expectedYieldKg: 1200,
        notes: 'Treated with Rhizobium culture before sowing.',
      },
    ]);

    // 4. Seed Soil Report
    await SoilReport.create({
      userId: farmer._id,
      farmId: farm._id,
      sampleName: 'North Field Block A',
      phLevel: 6.8,
      nitrogenKgHa: 260,
      phosphorusKgHa: 18,
      potassiumKgHa: 220,
      organicCarbonPercent: 0.65,
      moisturePercent: 38,
      healthGrade: 'Deficient',
      recommendations: [
        'Soil pH (6.8) is in optimal range for nutrient absorption.',
        'Low Nitrogen (260 kg/ha). Apply split dose of Neem-coated Urea or vermicompost.',
        'Phosphorus level (18 kg/ha) is healthy for root growth.',
        'Potassium level (220 kg/ha) is optimal for pest defense.',
      ],
    });

    // 5. Seed Weather & Pest Alerts
    await WeatherPestAlert.create([
      {
        title: 'Fall Armyworm Infestation Alert',
        alertType: 'Pest Outbreak',
        severity: 'High',
        region: { state: 'Maharashtra', district: 'Pune' },
        affectedCrops: ['Maize', 'Wheat', 'Sorghum'],
        symptoms: 'Pinholes in leaves and sawdust-like frass inside whorls.',
        preventiveAction: 'Install pheromone traps (5 traps/acre) and spray Emamectin Benzoate 5% SG @ 0.4 g/L.',
        recommendedPesticideOrRemedy: 'Neem Oil 10000 ppm or Bio-pesticide Beauveria bassiana.',
        createdBy: admin._id,
      },
      {
        title: 'Downy Mildew & Fungal Blight Advisory',
        alertType: 'Fungal Infection',
        severity: 'Moderate',
        region: { state: 'Maharashtra', district: 'Pune' },
        affectedCrops: ['Tomato', 'Grapes', 'Cucumber'],
        symptoms: 'Yellow patches on upper leaf surfaces and grayish downy growth underneath.',
        preventiveAction: 'Ensure good air circulation, avoid evening overhead irrigation, apply copper oxychloride.',
        recommendedPesticideOrRemedy: 'Mancozeb 75% WP @ 2.5 g/L of water.',
        createdBy: admin._id,
      },
    ]);

    // 6. Seed Agricultural Products
    await Product.create([
      {
        name: 'Certified Sharbati Wheat Seeds',
        category: 'Seeds',
        price: 850,
        unit: '40 kg bag',
        stock: 50,
        description: 'Certified rust-resistant, drought-tolerant high-yield Sharbati wheat seeds.',
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Organic Vermicompost Enriched with Trichoderma',
        category: 'Fertilizers',
        price: 450,
        unit: '50 kg bag',
        stock: 120,
        description: '100% natural organic compost enriched with beneficial microbes for soil aeration and nutrient boost.',
        imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Pure Cold-Pressed Neem Oil (10,000 PPM)',
        category: 'Organic Pesticides',
        price: 380,
        unit: '1 Liter',
        stock: 80,
        description: 'Potent organic botanical pesticide effective against caterpillars, aphids, thrips, and mites.',
        imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Smart Drip Irrigation Emitter Kit (0.5 Acre)',
        category: 'Irrigation Tools',
        price: 2400,
        unit: 'Set',
        stock: 25,
        description: 'Complete water-saving micro-irrigation set with inline drippers, filter, and connectors.',
        imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Bio-NPK Liquid Consortia',
        category: 'Fertilizers',
        price: 320,
        unit: '1 Liter',
        stock: 60,
        description: 'Microbial biofertilizer that fixes atmospheric nitrogen, solubilizes phosphorus, and mobilizes potash.',
        imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=500&auto=format&fit=crop&q=60',
      },
    ]);

    // 7. Seed Forum Posts
    await ForumPost.create([
      {
        userId: farmer._id,
        authorName: 'Suresh Patil',
        title: 'Curling and yellowing of tomato leaves in flowering stage',
        cropCategory: 'Vegetable Crops',
        question: 'My tomato plants are starting to flower, but some leaves are showing upward curling and slight chlorosis. Soil moisture is regular. What could be the issue?',
        tags: ['Tomato', 'Pest', 'Yellowing'],
        upvotes: 4,
        status: 'Resolved',
        replies: [
          {
            userId: admin._id,
            authorName: 'Dr. Ramesh Sharma (Admin & Agronomist)',
            authorRole: 'admin',
            comment: 'Upward curling with chlorosis during early flowering is typically caused by Whitefly transmission of Tomato Leaf Curl Virus (ToLCV). Inspect leaf undersides for tiny white flies. Spray Neem oil (3ml/L) or install yellow sticky traps (15 traps/acre) immediately.',
            isExpertResponse: true,
          },
        ],
      },
    ]);

    console.log('✅ AgriTech Database Seeded Successfully!');
    console.log('----------------------------------------------------');
    console.log('Admin Credentials  : admin@agritech.com / admin123');
    console.log('Farmer Credentials : farmer@agritech.com / farmer123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
