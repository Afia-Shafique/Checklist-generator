import React from 'react';
import { useTranslation } from 'react-i18next';

const FooterLandingPage = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <footer className={`footer-container ${isArabic ? 'rtl' : ''}`}>
      <div className="footer-top">
        <div className="footer-brand">
          <h2>{t('brand')}</h2>
          <p>{t('tagline')}</p>
        </div>
        <div className="footer-links">
          <h4>{t('quickLinks')}</h4>
          <ul>
            <li><a href="#features">{t('features')}</a></li>
            <li><a href="#demo">{t('watchDemo')}</a></li>
            <li><a href="#login">{t('getStarted')}</a></li>
            <li><a href="#contact">{t('contactUs')}</a></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>{t('contact')}</h4>
          <p>{t('email')}</p>
          <p>{t('phone')}</p>
        </div>
        <div className="footer-social">
          <h4>{t('followUs')}</h4>
          <div className="icons">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://x.com/i/flow/login" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://pk.linkedin.com/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t('rights')}</p>
      </div>
    </footer>
  );
};

export default FooterLandingPage;
