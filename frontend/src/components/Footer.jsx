import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-dark text-white py-4 mt-auto border-top border-success border-3">
      <div className="container text-center">
        <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
          <span className="fs-4">🌾</span>
          <span className="fw-bold fs-5 text-success">{t('appName')}</span>
        </div>
        <p className="text-muted small mb-2">{t('tagline')}</p>
        <p className="text-secondary small mb-0">
          Built with MERN Stack (MongoDB, Express.js, React.js, Node.js) &amp; Bootstrap.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
