import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-success text-white py-5 position-relative overflow-hidden">
        <div className="container py-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3">
                🌱 Smart Farming &amp; Agri-Tech Platform
              </span>
              <h1 className="display-4 fw-extrabold mb-3">
                Empowering Farmers Through Digital Intelligence
              </h1>
              <p className="lead opacity-90 mb-4">
                Bridge the gap between traditional agricultural expertise and modern data-driven
                technology. Access real-time weather forecasts, soil analysis, pest alerts,
                expert consultation, and quality agricultural supplies.
              </p>
              <div className="d-flex flex-wrap gap-3">
                {user ? (
                  <Link to="/dashboard" className="btn btn-warning btn-lg fw-bold rounded-pill px-4">
                    <i className="bi bi-speedometer2 me-2"></i> Go to Farmer Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-warning btn-lg fw-bold rounded-pill px-4">
                      Get Started Free
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg rounded-pill px-4">
                      Farmer &amp; Admin Login
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="col-lg-5 text-center">
              <div className="card shadow-lg border-0 rounded-4 p-4 text-dark bg-white">
                <div className="fs-1 mb-2">🚜 🌾 🌦️</div>
                <h4 className="fw-bold text-success mb-2">Quick Evaluation Logins</h4>
                <p className="text-muted small mb-3">
                  Pre-configured demo accounts for assessment testing:
                </p>
                <div className="bg-light p-3 rounded-3 text-start mb-2">
                  <span className="badge bg-success mb-1">Farmer Account</span>
                  <div className="small fw-semibold">Email: <code>farmer@agritech.com</code></div>
                  <div className="small fw-semibold">Password: <code>farmer123</code></div>
                </div>
                <div className="bg-light p-3 rounded-3 text-start">
                  <span className="badge bg-primary mb-1">Admin &amp; Agronomist</span>
                  <div className="small fw-semibold">Email: <code>admin@agritech.com</code></div>
                  <div className="small fw-semibold">Password: <code>admin123</code></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center max-w-700 mx-auto mb-5">
            <h2 className="fw-bold">Comprehensive Agricultural Solutions</h2>
            <p className="text-muted">
              Built on the robust MERN stack with relational integrity and multilingual support.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="agri-card p-4 h-100">
                <div className="fs-2 mb-3 text-success">🌱</div>
                <h5 className="fw-bold">Crop Monitoring &amp; Lifecycle</h5>
                <p className="text-muted small mb-0">
                  Track crop growth stages from sowing to harvest with health risk detection
                  and yield predictions.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="agri-card p-4 h-100">
                <div className="fs-2 mb-3 text-success">🧪</div>
                <h5 className="fw-bold">Soil Health &amp; NPK Advisor</h5>
                <p className="text-muted small mb-0">
                  Automated algorithmic soil analysis for pH, Nitrogen, Phosphorus, and Potassium
                  with precise fertilizer dosages.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="agri-card p-4 h-100">
                <div className="fs-2 mb-3 text-success">🌦️</div>
                <h5 className="fw-bold">Weather &amp; Pest Early Warnings</h5>
                <p className="text-muted small mb-0">
                  Open-Meteo 5-day weather forecasts and farmer-relevant pest outbreak notifications with
                  preventive remedies.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="agri-card p-4 h-100">
                <div className="fs-2 mb-3 text-success">🛒</div>
                <h5 className="fw-bold">Direct Resource Marketplace</h5>
                <p className="text-muted small mb-0">
                  Order high-yield seeds, organic fertilizers, and micro-irrigation tools with
                  instant order status tracking.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="agri-card p-4 h-100">
                <div className="fs-2 mb-3 text-success">💬</div>
                <h5 className="fw-bold">Community Forum &amp; Advisory</h5>
                <p className="text-muted small mb-0">
                  Connect with fellow farmers and certified agronomists for prompt crop troubleshooting
                  and best practices.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="agri-card p-4 h-100">
                <div className="fs-2 mb-3 text-success">🛡️</div>
                <h5 className="fw-bold">Admin Management Portal</h5>
                <p className="text-muted small mb-0">
                  Role-based security (JWT) giving administrators complete system oversight, inventory control, and alert broadcasting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
