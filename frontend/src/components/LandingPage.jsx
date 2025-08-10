import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();

  return (
    <section className={`landing-container ${isArabic ? 'rtl' : ''}`}>
      {/* Hero Section */}
      <div className="landing-hero" style={{ 
        backgroundImage: `linear-gradient(135deg, rgba(1, 110, 79, 0.7) 0%, rgba(255, 167, 37, 0.6) 100%), url(/hero-bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <h1 className="landing-title">{t('welcome')}</h1>
        <p className="landing-subtitle">{t('subtext')}</p>
        <div className="cta-buttons">
          <button className="cta-button primary" onClick={() => navigate('/login')}>{t('get_started')}</button>
          <button className="cta-button secondary" onClick={() => navigate('/demo')}>
            {isArabic ? (
              <>
                <span className="arrow-icon">←</span> {t('watch_demo')}
              </>
            ) : (
              <>
                {t('watch_demo')} <span className="arrow-icon">→</span>
              </>
            )}
          </button>
        </div>
      </div>
      {/* Features Section */}
      <div className={`features-section ${isArabic ? 'rtl' : ''}`}>
        <h2 className="section-title">{t('features_title')}</h2>
        <div className="features-container">
          <FeatureCard title={t('feature1_title')} desc={t('feature1_desc')} />
          <FeatureCard title={t('feature2_title')} desc={t('feature2_desc')} />
          <FeatureCard title={t('feature3_title')} desc={t('feature3_desc')} />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ title, desc }) => (
  <div className="feature-card">
    <h3 className="feature-title">{title}</h3>
    <p className="feature-desc">{desc}</p>
  </div>
);

export default LandingPage;
