import React, { useState, useEffect } from 'react';
import { AdminAPI, WeatherAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const [alertForm, setAlertForm] = useState({
    title: '',
    alertType: 'Pest Outbreak',
    severity: 'High',
    state: 'Maharashtra',
    district: 'Pune',
    affectedCrops: 'Wheat, Maize',
    preventiveAction: '',
    recommendedPesticideOrRemedy: '',
  });

  const fetchAdminData = async () => {
    try {
      const data = await AdminAPI.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    try {
      await WeatherAPI.createPestAlert({
        title: alertForm.title,
        alertType: alertForm.alertType,
        severity: alertForm.severity,
        region: { state: alertForm.state, district: alertForm.district },
        affectedCrops: alertForm.affectedCrops.split(',').map((s) => s.trim()),
        preventiveAction: alertForm.preventiveAction,
        recommendedPesticideOrRemedy: alertForm.recommendedPesticideOrRemedy,
      });

      alert('Pest Alert Broadcasted successfully to all farmers!');
      setShowAlertModal(false);
      fetchAdminData();
    } catch (err) {
      alert('Failed to broadcast alert: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge bg-danger mb-1">Restricted Access (Role: Admin)</span>
          <h2 className="fw-bold mb-1">🛡️ AgriTech Admin Management Portal</h2>
          <p className="text-muted small mb-0">System-wide monitoring, agricultural advisories, and database oversight</p>
        </div>
        <button className="btn btn-danger rounded-pill px-4 shadow-sm" onClick={() => setShowAlertModal(true)}>
          <i className="bi bi-broadcast me-1"></i> Broadcast Pest Alert
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : metrics ? (
        <>
          {/* Metrics Grid */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <div className="kpi-card info-kpi">
                <div className="text-muted small fw-semibold">Total Registered Users</div>
                <div className="display-6 fw-bold text-info my-1">{metrics.totalUsers}</div>
                <div className="small text-muted">{metrics.totalFarmers} Active Farmers</div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="kpi-card">
                <div className="text-muted small fw-semibold">Managed Farm Plots</div>
                <div className="display-6 fw-bold text-success my-1">{metrics.totalFarms}</div>
                <div className="small text-muted">{metrics.totalCrops} Active Crop Cycles</div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="kpi-card warning-kpi">
                <div className="text-muted small fw-semibold">Marketplace Revenue</div>
                <div className="display-6 fw-bold text-warning my-1">₹{metrics.totalRevenue}</div>
                <div className="small text-muted">{metrics.totalOrders} Orders Fulfilled</div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="kpi-card danger-kpi">
                <div className="text-muted small fw-semibold">Active Pest Alerts</div>
                <div className="display-6 fw-bold text-danger my-1">{metrics.activeAlerts}</div>
                <div className="small text-muted">Broadcast in System</div>
              </div>
            </div>
          </div>

          {/* Admin Operations Section */}
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="agri-card p-4 h-100">
                <h5 className="fw-bold mb-3">🛠️ Admin Quick Controls</h5>
                <ul className="list-group list-group-flush small">
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <div>
                      <strong>Emergency Advisory Dispatch</strong>
                      <div className="text-muted">Broadcast weather warnings directly to farmers' dashboard banners</div>
                    </div>
                    <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => setShowAlertModal(true)}>
                      Dispatch
                    </button>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <div>
                      <strong>Soil Diagnostic Engine</strong>
                      <div className="text-muted">Total tests logged: {metrics.totalSoilReports}</div>
                    </div>
                    <span className="badge bg-success">Algorithmic NPK Active</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <div>
                      <strong>Database Integrity &amp; Relational Indexing</strong>
                      <div className="text-muted">MongoDB Collections: Users, Farms, Crops, Soil, Alerts, Orders</div>
                    </div>
                    <span className="badge bg-primary">Connected</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="agri-card p-4 h-100">
                <h5 className="fw-bold mb-3">🌾 System Health &amp; Audit Status</h5>
                <div className="p-3 bg-light rounded-3 mb-3 small">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Role-Based JWT Security:</span>
                    <strong className="text-success">Enabled (bcrypt + Bearer Token)</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>API Response Status:</span>
                    <strong className="text-success">200 OK</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Active Session:</span>
                    <strong>{user?.name} ({user?.email})</strong>
                  </div>
                </div>

                <div className="alert alert-info border-0 small mb-0">
                  <i className="bi bi-info-circle-fill me-1"></i> As an administrator, your responses in the Community Forum
                  will automatically receive the <strong>Verified Expert Advisory</strong> green badge.
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Broadcast Alert Modal */}
      {showAlertModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">🚨 Broadcast Pest / Weather Warning</h5>
                <button type="button" className="btn-close" onClick={() => setShowAlertModal(false)}></button>
              </div>
              <form onSubmit={handleBroadcastAlert}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Alert Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Locust Swarm Warning or Aphid Outbreak"
                      value={alertForm.title}
                      onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Alert Category</label>
                      <select
                        className="form-select"
                        value={alertForm.alertType}
                        onChange={(e) => setAlertForm({ ...alertForm, alertType: e.target.value })}
                      >
                        <option value="Pest Outbreak">Pest Outbreak</option>
                        <option value="Fungal Infection">Fungal Infection</option>
                        <option value="Weather Warning">Weather Warning</option>
                        <option value="Harvest Advisory">Harvest Advisory</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Severity</label>
                      <select
                        className="form-select"
                        value={alertForm.severity}
                        onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Moderate">Moderate</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Affected Crops (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Wheat, Tomato, Mustard"
                      value={alertForm.affectedCrops}
                      onChange={(e) => setAlertForm({ ...alertForm, affectedCrops: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Actionable Preventive Advisory</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Immediate measures for farmers to mitigate crop loss..."
                      value={alertForm.preventiveAction}
                      onChange={(e) => setAlertForm({ ...alertForm, preventiveAction: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Recommended Remedy / Chemical</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Neem Oil 10,000 PPM or Chlorpyriphos 20% EC"
                      value={alertForm.recommendedPesticideOrRemedy}
                      onChange={(e) => setAlertForm({ ...alertForm, recommendedPesticideOrRemedy: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill" onClick={() => setShowAlertModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger rounded-pill px-4">
                    Emit Warning to Platform
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
