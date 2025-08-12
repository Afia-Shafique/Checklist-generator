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
    
    // Set document direction and language
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    
    // Add/remove RTL class to body for CSS targeting
    if (newLang === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
    
    console.log('Language changed to:', newLang);
    console.log('Document dir:', document.documentElement.dir);
    console.log('Body has rtl class:', document.body.classList.contains('rtl'));
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand} onClick={() => navigate('/')} role="button">
        <img src="/LogoBrain.svg" alt="Logo" style={styles.logoImg} />
      </div>
      <div style={styles.actions}>
        <button onClick={toggleLanguage} style={{ ...styles.button, ...styles.orangeButton, minWidth: 100 }}>
          {i18n.language === 'en' ? 'العربية' : 'English'}
        </button>
        {!isLoginPage && (
          <button onClick={handleLoginClick} style={{ ...styles.button, ...styles.orangeButton, minWidth: 120 }}>
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
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)',
    position: 'static',
    width: '100%',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    transition: 'transform 0.2s ease',
  },
  logoImg: {
    height: '60px',
    marginRight: '0.5rem',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  button: {
    padding: '0.6rem 1.2rem',
    border: 'none',
    borderRadius: '20px',
    backgroundColor: '#ffa725',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(255, 167, 37, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  orangeButton: {
    background: 'linear-gradient(135deg, #ffa725 0%, #ff8c00 100%)',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(255, 167, 37, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
};

export default Navbar;
