import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
            <div className="text-center mb-4">
              <span className="fs-1">🌾</span>
              <h3 className="fw-bold text-success mt-2">{t('appName')}</h3>
              <p className="text-muted small">Sign in to your farmer or admin account</p>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@agritech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-success w-100 py-2 fw-bold rounded-3"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : t('login')}
              </button>
            </form>

            <div className="mt-4 pt-3 border-top text-center">
              <p className="text-muted small mb-2">Quick Demo Accounts (1-Click Fill):</p>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success rounded-pill"
                  onClick={() => fillCredentials('farmer@agritech.com', 'farmer123')}
                >
                  🧑‍🌾 Fill Farmer
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill"
                  onClick={() => fillCredentials('admin@agritech.com', 'admin123')}
                >
                  🛡️ Fill Admin
                </button>
              </div>
            </div>

            <div className="text-center mt-4">
              <span className="text-muted small">Don't have an account yet? </span>
              <Link to="/register" className="small text-success fw-bold text-decoration-none">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
