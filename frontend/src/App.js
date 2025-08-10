import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './i18n'; // Import i18n configuration
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Help from './components/Help';
import DemoPage from './components/DemoPage';
import FooterLandingPage from './components/FooterLandingPage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <>
              <Navbar />
              <LandingPage />
              <FooterLandingPage />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/demo" element={
            <>
              <Navbar />
              <DemoPage />
              <FooterLandingPage />
            </>
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/help" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Existing Routes */}
          <Route path="/upload" element={
            <>
              <Navbar />
              <UploadPage />
              <FooterLandingPage />
            </>
          } />
          <Route path="/results" element={
            <>
              <Navbar />
              <ResultsPage />
              <FooterLandingPage />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;