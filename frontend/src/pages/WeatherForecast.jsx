import React, { useState, useEffect } from 'react';
import { WeatherAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import PestAlertBanner from '../components/PestAlertBanner';

const WeatherForecast = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [district, setDistrict] = useState(user?.location?.district || 'Pune');
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchWeather = async (targetDistrict) => {
    setLoading(true);
    try {
      const data = await WeatherAPI.getForecast(targetDistrict);
      setForecastData(data);
      setLoadError('');
    } catch (e) {
      setForecastData(null);
      setLoadError(e.response?.data?.message || 'Could not retrieve weather. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(district);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(district);
  };

  return (
    <div className="container py-4">
      {/* Header and District Selector */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">🌦️ {t('weather')}</h2>
          <p className="text-muted small mb-0">Microclimate forecasts and disease outbreak early warning systems</p>
        </div>
        <form onSubmit={handleSearch} className="d-flex gap-2 mt-2 mt-md-0">
          <input
            type="text"
            className="form-control form-control-sm rounded-pill px-3"
            placeholder="Enter district (e.g. Pune, Nashik)"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
          <button type="submit" className="btn btn-success btn-sm rounded-pill px-3">
            Search
          </button>
        </form>
      </div>

      {/* Pest Alerts */}
      <PestAlertBanner />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : loadError ? (
        <div className="alert alert-warning" role="alert">{loadError}</div>
      ) : forecastData ? (
        <>
          {/* Today's Highlight Card */}
          <div className="card text-white bg-success shadow border-0 rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden">
            <div className="row align-items-center">
              <div className="col-md-7">
                <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
                  📍 {forecastData.current.location}
                </span>
                <h1 className="display-3 fw-bold mb-1">{forecastData.current.temperature}°C</h1>
                <h4 className="fw-semibold opacity-90 mb-3">{forecastData.current.condition}</h4>
                <p className="lead mb-0 opacity-90">
                  <i className="bi bi-info-circle me-1"></i> {forecastData.current.advisory}
                </p>
              </div>

              <div className="col-md-5 mt-4 mt-md-0">
                <div className="row g-2 text-center text-dark">
                  <div className="col-6">
                    <div className="bg-white p-3 rounded-4 shadow-sm">
                      <div className="text-muted small">{t('humidity')}</div>
                      <div className="fs-4 fw-bold text-success">{forecastData.current.humidity}%</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-white p-3 rounded-4 shadow-sm">
                      <div className="text-muted small">{t('rainProbability')}</div>
                      <div className="fs-4 fw-bold text-primary">{forecastData.current.precipitationProbability}%</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-white p-3 rounded-4 shadow-sm">
                      <div className="text-muted small">{t('windSpeed')}</div>
                      <div className="fs-4 fw-bold text-secondary">{forecastData.current.windSpeedKmh} km/h</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-white p-3 rounded-4 shadow-sm">
                      <div className="text-muted small">Spray Safety Index</div>
                      <div className="fs-4 fw-bold text-success">Optimal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Day Extended Forecast */}
          <h5 className="fw-bold mb-3">{t('fiveDayForecast')}</h5>
          <div className="row g-3 mb-4">
            {forecastData.weekly.map((dayItem, index) => (
              <div key={index} className="col-6 col-md-4 col-lg-2-4" style={{ flex: '1 0 18%' }}>
                <div className="agri-card p-3 text-center h-100">
                  <div className="fw-bold mb-1 text-dark">{dayItem.day}</div>
                  <div className="fs-2 my-1">
                    {dayItem.precipitationProbability > 50
                      ? '🌧️'
                      : dayItem.precipitationProbability > 20
                      ? '⛅'
                      : '☀️'}
                  </div>
                  <div className="fs-5 fw-bold text-success">{dayItem.temperature}°C</div>
                  <small className="text-muted d-block">{dayItem.condition}</small>
                  <div className="mt-2 pt-2 border-top small text-primary fw-semibold">
                    💧 {dayItem.precipitationProbability}% Rain
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Field Operations Advisory Matrix */}
          <div className="agri-card p-4">
            <h5 className="fw-bold mb-3">📋 Weather-Driven Farming Operations Guide</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3 h-100">
                  <h6 className="fw-bold text-success">🌱 Sowing &amp; Transplantation</h6>
                  <p className="small text-muted mb-0">
                    Suitable soil temperature and moderate humidity. Sowing of Rabi pulses and wheat
                    can proceed normally.
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3 h-100">
                  <h6 className="fw-bold text-primary">💧 Irrigation Scheduling</h6>
                  <p className="small text-muted mb-0">
                    {forecastData.current.precipitationProbability > 40
                      ? 'Hold off surface irrigation due to imminent shower possibilities.'
                      : 'Light drip irrigation recommended for vegetable beds in morning hours.'}
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3 h-100">
                  <h6 className="fw-bold text-warning">🛡️ Chemical &amp; Bio-Spraying</h6>
                  <p className="small text-muted mb-0">
                    Wind speed below 15 km/h is safe for drift-free foliar pesticide spraying.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default WeatherForecast;
