const { sendControllerError } = require('../middleware/errorMiddleware');
const WeatherPestAlert = require('../models/WeatherPestAlert');

const describeWeather = (code) => {
  if (code === 0) return 'Clear sky';
  if ([1, 2].includes(code)) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Unknown conditions';
};

const fetchForecast = async (district, state) => {
  const locationQuery = [district, state, 'India'].filter(Boolean).join(',');
  const geocodeResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationQuery)}&count=1&language=en&format=json`, { signal: AbortSignal.timeout(7000) });
  if (!geocodeResponse.ok) throw new Error('Weather location lookup failed');
  const geocode = await geocodeResponse.json();
  const place = geocode.results?.[0];
  if (!place) throw new Error(`No weather location found for ${district}, ${state}`);

  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '5',
  });
  const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: AbortSignal.timeout(7000) });
  if (!weatherResponse.ok) throw new Error('Weather provider is temporarily unavailable');
  const weather = await weatherResponse.json();
  const location = [place.name, place.admin1].filter(Boolean).join(', ');
  const advisories = (rain) => rain >= 50
    ? 'Rain is likely. Check field drainage and avoid spraying before rainfall.'
    : 'Review soil moisture before irrigation and field operations.';
  const current = weather.current;
  const weekly = weather.daily.time.map((date, index) => {
    const rain = weather.daily.precipitation_probability_max[index] ?? 0;
    return {
      day: index === 0 ? 'Today' : new Date(`${date}T12:00:00`).toLocaleDateString('en', { weekday: 'long' }),
      location,
      temperature: weather.daily.temperature_2m_max[index],
      minTemp: weather.daily.temperature_2m_min[index],
      humidity: current.relative_humidity_2m,
      precipitationProbability: rain,
      windSpeedKmh: current.wind_speed_10m,
      condition: describeWeather(weather.daily.weather_code[index]),
      advisory: advisories(rain),
    };
  });
  return {
    current: {
      ...weekly[0],
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      precipitationProbability: weather.daily.precipitation_probability_max[0] ?? 0,
      windSpeedKmh: current.wind_speed_10m,
      condition: describeWeather(current.weather_code),
    },
    weekly,
  };
};

// @desc    Get current weather & 5-day forecast
// @route   GET /api/weather/forecast
// @access  Public / Private
const getWeatherForecast = async (req, res) => {
  try {
    const district = req.query.district || (req.user?.location?.district) || 'Pune';
    const state = req.query.state || (req.user?.location?.state) || 'Maharashtra';

    const forecast = await fetchForecast(district, state);
    res.json({
      success: true,
      data: {
        current: forecast[0],
        weekly: forecast,
      },
    });
  } catch (error) {
    res.status(502).json({ success: false, message: error.message || 'Weather service unavailable' });
  }
};

// @desc    Get active pest and disease alerts
// @route   GET /api/weather/pest-alerts
// @access  Public / Private
const getPestAlerts = async (req, res) => {
  try {
    const alerts = await WeatherPestAlert.find({ isActive: true, validUntil: { $gt: new Date() } })
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Create/Broadcast new pest alert (Admin only)
// @route   POST /api/weather/pest-alerts
// @access  Private / Admin
const createPestAlert = async (req, res) => {
  try {
    const { title, alertType, severity, region, affectedCrops, symptoms, preventiveAction, recommendedPesticideOrRemedy } = req.body;

    if (typeof title !== 'string' || !title.trim() || title.length > 160 || typeof preventiveAction !== 'string' || !preventiveAction.trim() || preventiveAction.length > 1000) {
      return res.status(400).json({ success: false, message: 'Please provide alert title and preventive action' });
    }

    const alert = await WeatherPestAlert.create({
      title: title.trim(),
      alertType: alertType || 'Pest Outbreak',
      severity: severity || 'Moderate',
      region: region || { state: 'Maharashtra', district: 'Pune' },
      affectedCrops: affectedCrops || ['Wheat', 'Gram', 'Tomato'],
      symptoms: symptoms || '',
      preventiveAction: preventiveAction.trim(),
      recommendedPesticideOrRemedy: recommendedPesticideOrRemedy || '',
      createdBy: req.user._id,
      isActive: true,
    });

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Update alert status
// @route   PUT /api/weather/pest-alerts/:id
// @access  Private / Admin
const updatePestAlert = async (req, res) => {
  try {
    const fields = ['title', 'alertType', 'severity', 'region', 'affectedCrops', 'symptoms', 'preventiveAction', 'recommendedPesticideOrRemedy', 'isActive', 'validUntil'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => fields.includes(key)));
    const alert = await WeatherPestAlert.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

module.exports = {
  getWeatherForecast,
  getPestAlerts,
  createPestAlert,
  updatePestAlert,
};
