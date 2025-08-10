import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('=== LOGIN DEBUG ===');
      console.log('Sending login request with:', { email: formData.email, password: '***' });
      
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Backend response data:', data);
      
      if (response.ok && data.token) {
        console.log('Login successful!');
        console.log('Token received:', data.token ? 'YES' : 'NO');
        console.log('User data received:', data.user ? 'YES' : 'NO');
        console.log('User data details:', data.user);
        
        localStorage.setItem('token', data.token);
        
        if (data.user) {
          console.log('Storing user info in localStorage:', data.user);
          localStorage.setItem('userInfo', JSON.stringify(data.user));
        } else {
          console.log('No user data received from backend');
        }
        
        navigate('/dashboard');
      } else {
        console.log('Login failed:', data.error);
        setErrors({ general: data.error || 'Login failed' });
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ general: 'Network error' });
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-left">
          <div className="logo-container">
            <img 
              src="/LogoBrain.svg" 
              alt="Logo" 
              className="auth-logo"
            />
          </div>
        </div>
        
        <div className="auth-right">
          <div className="auth-form-container">
            <h1 className="auth-title">Login</h1>
            <p className="auth-subtitle">Enter your details and let's get started.</p>
            
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                />
                {errors.email && (
                  <div className="error-message">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                />
                {errors.password && (
                  <div className="error-message">
                    {errors.password}
                  </div>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot your password?
                </Link>
              </div>

              <button 
                type="submit" 
                className={`auth-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-footer">
              <p className="signup-text">
                Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
