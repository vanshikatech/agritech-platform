import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FarmAPI, CropAPI, SoilAPI } from '../services/api';
import WeatherWidget from '../components/WeatherWidget';
import PestAlertBanner from '../components/PestAlertBanner';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [soilReports, setSoilReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [farmData, cropData, soilData] = await Promise.all([
          FarmAPI.getAll(),
          CropAPI.getAll(),
          SoilAPI.getAll(),
        ]);
        setFarms(farmData || []);
        setCrops(cropData || []);
        setSoilReports(soilData || []);
      } catch (err) {
        console.error('Dashboard data load error:', err);
        setLoadError(err.response?.data?.message || 'Could not load farm data. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const totalAcres = farms.reduce((sum, f) => sum + (f.totalAreaAcres || 0), 0);
  const healthyCrops = crops.filter((c) => c.healthStatus === 'Healthy' || c.healthStatus === 'Excellent').length;

  return (
    <div className="container py-4">
      {loadError && <div className="alert alert-danger" role="alert">{loadError}</div>}
      {/* Top Welcome & Quick Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">
            {t('welcome')}, {user?.name || 'Farmer'} 🧑‍🌾
          </h2>
          <p className="text-muted small mb-0">
            Smart farm overview for {user?.location?.district || 'Pune'}, {user?.location?.state || 'Maharashtra'}
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <Link to="/crops" className="btn btn-success btn-sm rounded-pill px-3 shadow-sm">
            <i className="bi bi-plus-circle me-1"></i> {t('addCrop')}
          </Link>
          <Link to="/soil" className="btn btn-outline-success btn-sm rounded-pill px-3 shadow-sm">
            <i className="bi bi-droplet-half me-1"></i> {t('addSoilSample')}
          </Link>
        </div>
      </div>

      {/* Real-Time Pest & Weather Warning Alerts */}
      <PestAlertBanner />

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="kpi-card">
            <div className="text-muted small fw-semibold">{t('farms')}</div>
            <div className="display-6 fw-bold text-success my-1">{farms.length}</div>
            <div className="small text-muted">{totalAcres} Total Acres Managed</div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="kpi-card info-kpi">
            <div className="text-muted small fw-semibold">{t('activeCrops')}</div>
            <div className="display-6 fw-bold text-info my-1">{crops.length}</div>
            <div className="small text-muted">{healthyCrops} in Optimal Health</div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="kpi-card warning-kpi">
            <div className="text-muted small fw-semibold">{t('soilTested')}</div>
            <div className="display-6 fw-bold text-warning my-1">{soilReports.length}</div>
            <div className="small text-muted">Field Reports Logged</div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="kpi-card danger-kpi">
            <div className="text-muted small fw-semibold">Pest Risk Index</div>
            <div className="display-6 fw-bold text-danger my-1">Low-Med</div>
            <div className="small text-muted">Seasonal Watch Active</div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Weather Widget */}
        <div className="col-lg-5">
          <WeatherWidget district={user?.location?.district || 'Pune'} />

          <div className="card mt-3 border-0 shadow-sm rounded-4 p-3 bg-light">
            <h6 className="fw-bold mb-2">💡 Daily Agronomic Tip</h6>
            <p className="small text-muted mb-0">
              Optimal time for foliar micro-nutrient spray is between 7:00 AM - 10:00 AM
              before midday heat causes stomatal closure.
            </p>
          </div>
        </div>

        {/* Active Crops Quick View */}
        <div className="col-lg-7">
          <div className="agri-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">🌱 Current Active Crops</h5>
              <Link to="/crops" className="btn btn-link btn-sm text-success text-decoration-none p-0 fw-semibold">
                Manage All →
              </Link>
            </div>

            {loading ? (
              <p className="text-muted small">Loading crops...</p>
            ) : crops.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted small mb-2">No active crops registered yet.</p>
                <Link to="/crops" className="btn btn-outline-success btn-sm rounded-pill">
                  Register Your First Crop
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Crop Name</th>
                      <th>Stage</th>
                      <th>Health</th>
                      <th>Harvest Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.slice(0, 4).map((crop) => (
                      <tr key={crop._id}>
                        <td>
                          <div className="fw-bold">{crop.cropName}</div>
                          <small className="text-muted">{crop.variety}</small>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success border border-success-subtle">
                            {crop.growthStage}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              crop.healthStatus === 'Healthy' || crop.healthStatus === 'Excellent'
                                ? 'bg-success'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {crop.healthStatus}
                          </span>
                        </td>
                        <td className="small text-muted">
                          {new Date(crop.expectedHarvestDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Soil Health Quick Snapshot */}
      <div className="agri-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">🧪 Recent Soil Nutrient Analysis</h5>
          <Link to="/soil" className="btn btn-link btn-sm text-success text-decoration-none p-0 fw-semibold">
            Soil Health Center →
          </Link>
        </div>

        {soilReports.length > 0 ? (
          <div className="row g-3">
            {soilReports.slice(0, 2).map((report) => (
              <div key={report._id} className="col-md-6">
                <div className="p-3 border rounded-3 bg-light">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-bold">{report.sampleName}</span>
                    <span className="badge bg-primary">pH: {report.phLevel}</span>
                  </div>
                  <div className="row text-center g-2 my-2 small">
                    <div className="col-4 bg-white p-2 rounded border">
                      <div className="text-muted">Nitrogen (N)</div>
                      <div className="fw-bold">{report.nitrogenKgHa} kg/ha</div>
                    </div>
                    <div className="col-4 bg-white p-2 rounded border">
                      <div className="text-muted">Phosphorus (P)</div>
                      <div className="fw-bold">{report.phosphorusKgHa} kg/ha</div>
                    </div>
                    <div className="col-4 bg-white p-2 rounded border">
                      <div className="text-muted">Potassium (K)</div>
                      <div className="fw-bold">{report.potassiumKgHa} kg/ha</div>
                    </div>
                  </div>
                  <div className="small text-secondary mt-2">
                    <strong>Advice:</strong> {report.recommendations?.[0] || 'Nutrient levels are stable.'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted small mb-0">No soil reports logged yet. Submit a sample for automated recommendations.</p>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
