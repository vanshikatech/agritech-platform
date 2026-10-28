import React, { useEffect, useState } from 'react';
import { WeatherAPI } from '../services/api';

const PestAlertBanner = () => {
  const [alerts, setAlerts] = useState([]);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await WeatherAPI.getPestAlerts();
        setAlerts(data);
        setLoadError('');
      } catch (err) {
        console.error('Pest alert fetch error', err);
        setLoadError(err.response?.data?.message || 'Pest alerts are temporarily unavailable.');
      }
    };
    fetchAlerts();
  }, []);

  if (loadError) return <div className="alert alert-warning py-2 small" role="status">{loadError}</div>;
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="mb-4">
      {alerts.map((alert) => (
        <div
          key={alert._id}
          className={`alert ${
            alert.severity === 'High' ? 'alert-danger' : 'alert-warning'
          } border-0 shadow-sm d-flex flex-column mb-2 rounded-3`}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-5">⚠️</span>
              <div>
                <strong>[{alert.alertType}] {alert.title}</strong>
                <span className="ms-2 badge bg-dark text-white">{alert.severity} Severity</span>
                <span className="ms-2 text-muted small">
                  Affects: {alert.affectedCrops?.join(', ')}
                </span>
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline-dark rounded-pill px-3"
              onClick={() =>
                setExpandedAlert(expandedAlert === alert._id ? null : alert._id)
              }
            >
              {expandedAlert === alert._id ? 'Close Details' : 'View Action Advisory'}
            </button>
          </div>

          {expandedAlert === alert._id && (
            <div className="mt-3 pt-3 border-top border-secondary-subtle">
              <div className="row g-2">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-1">🛡️ Recommended Preventive Action:</h6>
                  <p className="mb-0 text-dark small">{alert.preventiveAction}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold mb-1">🧪 Chemical / Organic Solution:</h6>
                  <p className="mb-0 text-dark small">{alert.recommendedPesticideOrRemedy || 'Consult agronomist'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PestAlertBanner;
