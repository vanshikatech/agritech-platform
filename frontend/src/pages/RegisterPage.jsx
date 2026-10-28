import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer',
    phone: '',
    language: 'en',
    state: 'Maharashtra',
    district: 'Pune',
    village: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
      language: formData.language,
      location: {
        state: formData.state,
        district: formData.district,
        village: formData.village,
      },
    };

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
            <div className="text-center mb-4">
              <span className="fs-1">🌾</span>
              <h3 className="fw-bold text-success mt-2">Join {t('appName')}</h3>
              <p className="text-muted small">Create an account for personalized farming tools</p>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="register-name" className="form-label small fw-semibold">Full Name</label>
                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Ramesh Patil"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="register-email" className="form-label small fw-semibold">Email Address</label>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="register-phone" className="form-label small fw-semibold">Phone Number</label>
                  <input
                    id="register-phone"
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="register-role" className="form-label small fw-semibold">Account Role</label>
                  <select
                    id="register-role"
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="farmer">Farmer (किसान)</option>
                    <option value="admin">Admin / Agronomist</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="register-language" className="form-label small fw-semibold">Preferred Language</label>
                  <select
                    id="register-language"
                    name="language"
                    className="form-select"
                    value={formData.language}
                    onChange={handleChange}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="register-district" className="form-label small fw-semibold">District</label>
                  <input
                    id="register-district"
                    type="text"
                    name="district"
                    className="form-control"
                    placeholder="Pune"
                    value={formData.district}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="register-village" className="form-label small fw-semibold">Village / Taluka</label>
                  <input
                    id="register-village"
                    type="text"
                    name="village"
                    className="form-control"
                    placeholder="Baramati"
                    value={formData.village}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="register-password" className="form-label small fw-semibold">Password (min 8 characters)</label>
                  <input
                    id="register-password"
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    required
                  />
                </div>

                <div className="col-12 mt-4">
                  <button
                    type="submit"
                    className="btn btn-success w-100 py-2 fw-bold rounded-3"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : t('register')}
                  </button>
                </div>
              </div>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted small">Already have an account? </span>
              <Link to="/login" className="small text-success fw-bold text-decoration-none">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
