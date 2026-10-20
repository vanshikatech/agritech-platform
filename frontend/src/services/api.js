import axios from 'axios';

// Support both local proxy (/api) and live deployed backend (e.g., on Render/Railway)
const API_BASE = import.meta.env.VITE_API_URL || '/api';


// Realistic fallback data for resilient student demonstration
const MOCK_FARMS = [
  {
    _id: 'farm_01',
    farmName: 'Patil Green Harvest Farm',
    totalAreaAcres: 6.5,
    soilType: 'Black Soil',
    irrigationType: 'Drip Irrigation',
    location: { state: 'Maharashtra', district: 'Pune', village: 'Baramati' },
    notes: 'Organic farming with crop rotation.',
  },
];

const MOCK_CROPS = [
  {
    _id: 'crop_01',
    farmId: { farmName: 'Patil Green Harvest Farm' },
    cropName: 'Wheat (Gehun)',
    variety: 'Sharbati HD-2967',
    areaCultivatedAcres: 3.5,
    sowingDate: '2026-10-01',
    expectedHarvestDate: '2027-02-15',
    growthStage: 'Vegetative',
    healthStatus: 'Healthy',
    expectedYieldKg: 4200,
    notes: 'First top dressing with neem-coated urea done.',
  },
  {
    _id: 'crop_02',
    farmId: { farmName: 'Patil Green Harvest Farm' },
    cropName: 'Tomato',
    variety: 'Abhinav Hybrid F1',
    areaCultivatedAcres: 2.0,
    sowingDate: '2026-09-15',
    expectedHarvestDate: '2026-12-20',
    growthStage: 'Flowering',
    healthStatus: 'Moderate',
    expectedYieldKg: 6500,
    notes: 'Staking completed. Watching for blight.',
  },
];

const MOCK_ALERTS = [
  {
    _id: 'alert_01',
    title: 'Fall Armyworm Infestation Alert',
    alertType: 'Pest Outbreak',
    severity: 'High',
    region: { state: 'Maharashtra', district: 'Pune' },
    affectedCrops: ['Maize', 'Wheat', 'Sorghum'],
    symptoms: 'Pinholes in leaves and sawdust-like frass inside whorls.',
    preventiveAction: 'Install pheromone traps (5 traps/acre) and spray Emamectin Benzoate 5% SG @ 0.4 g/L.',
    recommendedPesticideOrRemedy: 'Neem Oil 10000 ppm or Bio-pesticide Beauveria bassiana.',
  },
];

export const FarmAPI = {
  getAll: async () => {
    try {
      const res = await axios.get(`${API_BASE}/farms`);
      return res.data.data;
    } catch {
      return MOCK_FARMS;
    }
  },
  create: async (data) => {
    const res = await axios.post(`${API_BASE}/farms`, data);
    return res.data.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`${API_BASE}/farms/${id}`);
    return res.data;
  },
};

export const CropAPI = {
  getAll: async (farmId) => {
    try {
      const url = farmId ? `${API_BASE}/crops?farmId=${farmId}` : `${API_BASE}/crops`;
      const res = await axios.get(url);
      return res.data.data;
    } catch {
      return MOCK_CROPS;
    }
  },
  create: async (data) => {
    const res = await axios.post(`${API_BASE}/crops`, data);
    return res.data.data;
  },
  update: async (id, data) => {
    const res = await axios.put(`${API_BASE}/crops/${id}`, data);
    return res.data.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`${API_BASE}/crops/${id}`);
    return res.data;
  },
};

export const SoilAPI = {
  getAll: async () => {
    try {
      const res = await axios.get(`${API_BASE}/soil`);
      return res.data.data;
    } catch {
      return [
        {
          _id: 'soil_01',
          sampleName: 'North Field Block A',
          phLevel: 6.8,
          nitrogenKgHa: 260,
          phosphorusKgHa: 18,
          potassiumKgHa: 220,
          healthGrade: 'Deficient',
          recommendations: [
            'Soil pH (6.8) is optimal for high crop yield.',
            'Low Nitrogen (260 kg/ha). Top-dress with Neem-coated Urea or vermicompost.',
            'Phosphorus (18 kg/ha) & Potassium (220 kg/ha) are well balanced.',
          ],
        },
      ];
    }
  },
  create: async (data) => {
    const res = await axios.post(`${API_BASE}/soil`, data);
    return res.data.data;
  },
  analyzePreview: async (data) => {
    const res = await axios.post(`${API_BASE}/soil/analyze`, data);
    return res.data.data;
  },
};

export const WeatherAPI = {
  getForecast: async (district = 'Pune') => {
    try {
      const res = await axios.get(`${API_BASE}/weather/forecast?district=${district}`);
      return res.data.data;
    } catch {
      return {
        current: {
          temperature: 29,
          humidity: 62,
          precipitationProbability: 15,
          windSpeedKmh: 14,
          condition: 'Partly Cloudy',
          location: `${district}, Maharashtra`,
          advisory: 'Favorable conditions for field scouting and irrigation.',
        },
        weekly: [
          { day: 'Today', temperature: 29, precipitationProbability: 15, condition: 'Partly Cloudy' },
          { day: 'Tomorrow', temperature: 32, precipitationProbability: 5, condition: 'Sunny' },
          { day: 'Wed', temperature: 26, precipitationProbability: 65, condition: 'Scattered Showers' },
          { day: 'Thu', temperature: 25, precipitationProbability: 80, condition: 'Thunderstorm' },
          { day: 'Fri', temperature: 31, precipitationProbability: 10, condition: 'Clear Sky' },
        ],
      };
    }
  },
  getPestAlerts: async () => {
    try {
      const res = await axios.get(`${API_BASE}/weather/pest-alerts`);
      return res.data.data;
    } catch {
      return MOCK_ALERTS;
    }
  },
  createPestAlert: async (data) => {
    const res = await axios.post(`${API_BASE}/weather/pest-alerts`, data);
    return res.data.data;
  },
};

export const MarketAPI = {
  getProducts: async (category = '') => {
    try {
      const url = category ? `${API_BASE}/resources/products?category=${category}` : `${API_BASE}/resources/products`;
      const res = await axios.get(url);
      return res.data.data;
    } catch {
      return [
        {
          _id: 'p1',
          name: 'Certified Sharbati Wheat Seeds',
          category: 'Seeds',
          price: 850,
          unit: '40 kg bag',
          imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60',
          description: 'Certified rust-resistant, drought-tolerant high-yield Sharbati wheat seeds.',
        },
        {
          _id: 'p2',
          name: 'Organic Vermicompost Enriched',
          category: 'Fertilizers',
          price: 450,
          unit: '50 kg bag',
          imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&auto=format&fit=crop&q=60',
          description: '100% natural organic compost enriched with beneficial microbes.',
        },
        {
          _id: 'p3',
          name: 'Pure Cold-Pressed Neem Oil',
          category: 'Organic Pesticides',
          price: 380,
          unit: '1 Liter',
          imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60',
          description: 'Potent organic botanical pesticide against caterpillars, aphids, and mites.',
        },
      ];
    }
  },
  createOrder: async (orderData) => {
    const res = await axios.post(`${API_BASE}/orders`, orderData);
    return res.data.data;
  },
  getMyOrders: async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders/my-orders`);
      return res.data.data;
    } catch {
      return [];
    }
  },
};

export const ForumAPI = {
  getPosts: async (category = '', search = '') => {
    try {
      const res = await axios.get(`${API_BASE}/forum?category=${category}&search=${search}`);
      return res.data.data;
    } catch {
      return [
        {
          _id: 'post_01',
          authorName: 'Suresh Patil',
          title: 'Curling and yellowing of tomato leaves in flowering stage',
          cropCategory: 'Vegetable Crops',
          question: 'My tomato plants are starting to flower, but some leaves are showing upward curling and slight chlorosis. What could be the issue?',
          status: 'Resolved',
          upvotes: 4,
          replies: [
            {
              authorName: 'Dr. Ramesh Sharma (Admin & Agronomist)',
              comment: 'Inspect leaf undersides for Whiteflies. Spray Neem oil (3ml/L) or install yellow sticky traps (15 traps/acre) immediately.',
              isExpertResponse: true,
            },
          ],
        },
      ];
    }
  },
  createPost: async (data) => {
    const res = await axios.post(`${API_BASE}/forum`, data);
    return res.data.data;
  },
  addReply: async (postId, comment) => {
    const res = await axios.post(`${API_BASE}/forum/${postId}/reply`, { comment });
    return res.data.data;
  },
};

export const AdminAPI = {
  getMetrics: async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/metrics`);
      return res.data.data;
    } catch {
      return {
        totalUsers: 14,
        totalFarmers: 12,
        totalFarms: 16,
        totalCrops: 38,
        totalSoilReports: 22,
        totalOrders: 45,
        totalRevenue: 64200,
        activeAlerts: 3,
      };
    }
  },
};
