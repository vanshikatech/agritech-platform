const WeatherPestAlert = require('../models/WeatherPestAlert');

// Dynamic weather simulation engine with realistic seasonal values
const generateForecast = (district = 'Pune', state = 'Maharashtra') => {
  const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const conditions = [
    { cond: 'Partly Cloudy', temp: 29, min: 21, humidity: 62, rainChance: 15, icon: 'partly-cloudy' },
    { cond: 'Sunny / Warm', temp: 32, min: 22, humidity: 50, rainChance: 5, icon: 'sunny' },
    { cond: 'Scattered Showers', temp: 26, min: 20, humidity: 78, rainChance: 65, icon: 'rain' },
    { cond: 'Thunderstorm Watch', temp: 25, min: 19, humidity: 85, rainChance: 80, icon: 'thunderstorm' },
    { cond: 'Clear Sky', temp: 31, min: 21, humidity: 55, rainChance: 10, icon: 'clear' },
  ];

  return conditions.map((item, index) => ({
    day: days[index] || `Day ${index + 1}`,
    location: `${district}, ${state}`,
    temperature: item.temp,
    minTemp: item.min,
    humidity: item.humidity,
    precipitationProbability: item.rainChance,
    windSpeedKmh: Math.floor(12 + Math.random() * 10),
    condition: item.cond,
    advisory:
      item.rainChance > 50
        ? 'Heavy rain forecast. Postpone fertilizer application and pesticide spraying.'
        : 'Good atmospheric conditions for field irrigation and foliar feeding.',
  }));
};

// @desc    Get current weather & 5-day forecast
// @route   GET /api/weather/forecast
// @access  Public / Private
const getWeatherForecast = async (req, res) => {
  try {
    const district = req.query.district || (req.user?.location?.district) || 'Pune';
    const state = req.query.state || (req.user?.location?.state) || 'Maharashtra';

    const forecast = generateForecast(district, state);
    res.json({
      success: true,
      data: {
        current: forecast[0],
        weekly: forecast,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active pest and disease alerts
// @route   GET /api/weather/pest-alerts
// @access  Public / Private
const getPestAlerts = async (req, res) => {
  try {
    const alerts = await WeatherPestAlert.find({ isActive: true })
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create/Broadcast new pest alert (Admin only)
// @route   POST /api/weather/pest-alerts
// @access  Private / Admin
const createPestAlert = async (req, res) => {
  try {
    const { title, alertType, severity, region, affectedCrops, symptoms, preventiveAction, recommendedPesticideOrRemedy } = req.body;

    if (!title || !preventiveAction) {
      return res.status(400).json({ success: false, message: 'Please provide alert title and preventive action' });
    }

    const alert = await WeatherPestAlert.create({
      title,
      alertType: alertType || 'Pest Outbreak',
      severity: severity || 'Moderate',
      region: region || { state: 'Maharashtra', district: 'Pune' },
      affectedCrops: affectedCrops || ['Wheat', 'Gram', 'Tomato'],
      symptoms: symptoms || '',
      preventiveAction,
      recommendedPesticideOrRemedy: recommendedPesticideOrRemedy || '',
      createdBy: req.user._id,
      isActive: true,
    });

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update alert status
// @route   PUT /api/weather/pest-alerts/:id
// @access  Private / Admin
const updatePestAlert = async (req, res) => {
  try {
    const alert = await WeatherPestAlert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWeatherForecast,
  getPestAlerts,
  createPestAlert,
  updatePestAlert,
};
