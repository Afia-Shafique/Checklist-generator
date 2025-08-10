import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

  // Get user info from localStorage
  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  // Debug: Log what we're getting
  console.log('=== HEADER DEBUG ===');
  console.log('Token exists:', !!token);
  console.log('Raw userInfo from localStorage:', localStorage.getItem('userInfo'));
  console.log('Parsed userInfo:', userInfo);
  console.log('userInfo.full_name:', userInfo.full_name);
  console.log('userInfo.email:', userInfo.email);
  console.log('Will display name as:', userInfo.full_name || 'User');

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button className="menu-toggle" onClick={onMenuClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isDashboard && (
            <div className="header-titles">
              <h1 className="page-title">Project Compliance Dashboard</h1>
              <p className="page-subtitle">Manage and track compliance for construction project specifications.</p>
            </div>
          )}
        </div>
        <div className="header-right">
          <div className="search-container">
            <input 
              type="text" 
              className="search-bar" 
              placeholder="Search projects..."
            />
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {token && (
            <div className="user-section">
              <div className="user-info">
                <span className="user-name">{userInfo.full_name || 'User'}</span>
                <span className="user-company">{userInfo.email || 'Logged In'}</span>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
