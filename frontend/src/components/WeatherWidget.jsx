import React, { useEffect, useState } from 'react';
import { WeatherAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const WeatherWidget = ({ district = 'Pune' }) => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await WeatherAPI.getForecast(district);
        setWeather(data.current);
      } catch (err) {
        console.error('Weather widget fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [district]);

  if (loading) {
    return <div className="card p-3 shadow-sm text-center">Loading weather data...</div>;
  }

  if (!weather) return null;

  return (
    <div className="card text-white bg-dark shadow-sm border-0 overflow-hidden position-relative">
      <div
        className="position-absolute top-0 end-0 p-4 opacity-25 fs-1"
        style={{ pointerEvents: 'none' }}
      >
        🌤️
      </div>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span className="badge bg-success text-uppercase tracking-wider">
              <i className="bi bi-geo-alt-fill me-1"></i> {weather.location}
            </span>
          </div>
          <span className="text-warning fw-semibold">{weather.condition}</span>
        </div>

        <div className="d-flex align-items-baseline gap-3 my-2">
          <h1 className="display-4 fw-bold mb-0">{weather.temperature}°C</h1>
          <span className="text-secondary fs-5">| {weather.advisory.slice(0, 50)}...</span>
        </div>

        <hr className="border-secondary my-3" />

        <div className="row text-center g-2">
          <div className="col-4">
            <small className="text-secondary d-block">{t('humidity')}</small>
            <span className="fw-bold fs-6">💧 {weather.humidity}%</span>
          </div>
          <div className="col-4">
            <small className="text-secondary d-block">{t('rainProbability')}</small>
            <span className="fw-bold fs-6">🌧️ {weather.precipitationProbability}%</span>
          </div>
          <div className="col-4">
            <small className="text-secondary d-block">{t('windSpeed')}</small>
            <span className="fw-bold fs-6">💨 {weather.windSpeedKmh} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
