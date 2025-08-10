import React from 'react';
import { useTranslation } from 'react-i18next';

const DemoPage = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <div className={`demo-container ${isArabic ? 'rtl' : ''}`}>
      <div className="demo-hero">
                        <img src="/hero-bg.jpg" alt="Construction site" className="demo-hero-img" />
        <h1 className="demo-title">{t('demo.title')}</h1>
        <p className="demo-subtitle">{t('demo.subtitle')}</p>
      </div>
      
      <div className="demo-content">
        <div className="demo-steps">
          <div className="demo-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">{t('demo.uploadDocuments')}</h3>
              <p className="step-desc">{t('demo.uploadDocumentsDescription')}</p>
            </div>
          </div>
          <div className="demo-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">{t('demo.aiAnalysis')}</h3>
              <p className="step-desc">{t('demo.aiAnalysisDescription')}</p>
            </div>
          </div>
          <div className="demo-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">{t('demo.complianceValidation')}</h3>
              <p className="step-desc">{t('demo.complianceValidationDescription')}</p>
            </div>
          </div>
          <div className="demo-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3 className="step-title">{t('demo.generateReports')}</h3>
              <p className="step-desc">{t('demo.generateReportsDescription')}</p>
            </div>
          </div>
        </div>

        <div className="demo-features">
          <h2>{t('demo.keyFeaturesDemonstrated')}</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">📋</div>
              <h3>{t('demo.specificationParsing')}</h3>
              <p>{t('demo.specificationParsingDescription')}</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🏗️</div>
              <h3>{t('demo.codeCompliance')}</h3>
              <p>{t('demo.codeComplianceDescription')}</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✅</div>
              <h3>{t('demo.qualityAssurance')}</h3>
              <p>{t('demo.qualityAssuranceDescription')}</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3>{t('demo.reporting')}</h3>
              <p>{t('demo.reportingDescription')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
