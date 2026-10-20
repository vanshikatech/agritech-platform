import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { lang, changeLanguage, t } = useLanguage();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm sticky-top">
      <div className="container-fluid px-lg-4">
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-4" to="/">
          <span className="me-2 fs-3">🌾</span>
          <span>{t('appName')}</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#agritechNav"
          aria-controls="agritechNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="agritechNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i> {t('dashboard')}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/farms">
                    <i className="bi bi-geo-alt me-1"></i> {t('farms')}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/crops">
                    <i className="bi bi-flower1 me-1"></i> {t('crops')}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/soil">
                    <i className="bi bi-droplet-half me-1"></i> {t('soilHealth')}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/weather">
                    <i className="bi bi-cloud-sun me-1"></i> {t('weather')}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/marketplace">
                    <i className="bi bi-shop me-1"></i> {t('marketplace')}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/community">
                    <i className="bi bi-chat-dots me-1"></i> {t('community')}
                  </NavLink>
                </li>
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <NavLink className="nav-link text-warning fw-bold" to="/admin">
                      <i className="bi bi-shield-lock me-1"></i> {t('adminPanel')}
                    </NavLink>
                  </li>
                )}
              </>
            ) : (
              <li className="nav-item">
                <NavLink className="nav-link text-white" to="/">
                  <i className="bi bi-house me-1"></i> {t('home')}
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {/* Multilingual Selector */}
            <div className="dropdown">
              <button
                className="btn btn-outline-light btn-sm dropdown-toggle rounded-pill px-3"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                🌐 {lang === 'hi' ? 'हिंदी' : 'English'}
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <button
                    className={`dropdown-item ${lang === 'en' ? 'active' : ''}`}
                    onClick={() => changeLanguage('en')}
                  >
                    English (EN)
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item ${lang === 'hi' ? 'active' : ''}`}
                    onClick={() => changeLanguage('hi')}
                  >
                    हिंदी (Hindi)
                  </button>
                </li>
              </ul>
            </div>

            {/* Shopping Cart Pill */}
            {user && (
              <Link to="/marketplace" className="btn btn-warning btn-sm position-relative rounded-pill px-3 fw-bold">
                <i className="bi bi-cart3"></i> {t('cart')}
                {totalCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {totalCount}
                  </span>
                )}
              </Link>
            )}

            {/* User status or Login / Register */}
            {user ? (
              <div className="dropdown ms-2">
                <button
                  className="btn btn-light btn-sm dropdown-toggle rounded-pill px-3 fw-semibold text-success"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user.name.split(' ')[0]} ({user.role === 'admin' ? 'Admin' : 'Farmer'})
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li>
                    <Link className="dropdown-item" to="/dashboard">
                      <i className="bi bi-grid me-2"></i> {t('dashboard')}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/orders">
                      <i className="bi bi-box-seam me-2"></i> {t('orderHistory')}
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> {t('logout')}
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2 ms-2">
                <Link to="/login" className="btn btn-outline-light btn-sm rounded-pill px-3">
                  {t('login')}
                </Link>
                <Link to="/register" className="btn btn-light btn-sm rounded-pill px-3 text-success fw-bold">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
