import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const handleLoginClick = () => {
    navigate('/login'); // ✅ Go to Login route
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand} onClick={() => navigate('/')} role="button">
        <img src="/LogoBrain.svg" alt="Logo" style={styles.logoImg} />
      </div>
      <div style={styles.actions}>
        <button onClick={toggleLanguage} style={styles.button}>
          {i18n.language === 'en' ? 'العربية' : 'English'}
        </button>
        {!isLoginPage && (
          <button onClick={handleLoginClick} style={styles.button}>
            {t('login_button')}
          </button>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  logoImg: {
    height: '40px',
    marginRight: '0.5rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  button: {
    padding: '0.5rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    color: '#333',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },
};

export default Navbar;
