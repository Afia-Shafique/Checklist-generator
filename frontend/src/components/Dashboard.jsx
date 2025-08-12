import React, { useState } from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import ComplianceTable from './ComplianceTable';
import Projects from './Projects';
import Reports from './Reports';
import Settings from './Settings';
import Help from './Help';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  const renderMainContent = () => {
    switch (location.pathname) {
      case '/dashboard':
        return (
          <div className="dashboard">
            {/* Project Overview Section */}
            <div className="project-overview">
              <h2 className="section-title">Project Overview</h2>
              <div className="project-details">
                <div className="project-info">
                  <h3>Project Alpha</h3>
                  <p>Construction of a new residential complex. Phase 1 completed, Phase 2 in progress.</p>
                </div>
                <div className="project-image-container">
                  <img
                    src={process.env.PUBLIC_URL + '/construction-placeholder.jpg'}
                    alt="Project Placeholder"
                    className="project-image-placeholder"
                    style={{ width: '320px', height: '180px', objectFit: 'cover', background: 'none', border: 'none', borderRadius: '12px' }}
                  />
                </div>
              </div>
            </div>

            {/* Compliance Checklist Section */}
            <ComplianceTable />
          </div>
        );
      case '/projects':
        return <Projects />;
      case '/reports':
        return <Reports />;
      case '/settings':
        return <Settings />;
      case '/help':
        return <Help />;
      default:
        return (
          <div className="dashboard">
            <div className="project-overview">
              <h2 className="section-title">Project Overview</h2>
              <div className="project-details">
                <div className="project-info">
                  <h3>Project Alpha</h3>
                  <p>Construction of a new residential complex. Phase 1 completed, Phase 2 in progress.</p>
                </div>
                <div className="project-image-container">
                  <img
                    src={process.env.PUBLIC_URL + '/placeholder-construction.svg'}
                    alt="Construction Placeholder"
                    className="project-image-placeholder"
                    style={{ width: '180px', height: '180px', background: 'none', border: 'none' }}
                  />
                </div>
              </div>
            </div>
            <ComplianceTable />
          </div>
        );
    }
  };

  return (
    <div className="app">
      <Sidebar isOpen={sidebarOpen} />
      <div className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <Header onMenuClick={handleMenuClick} onLogout={handleLogout} />
        <div className="content-wrapper">
          {renderMainContent()}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
