import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    phoneNumber: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Company name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    // Phone number validation - more lenient
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      // Remove all non-digit characters for validation
      const digitsOnly = formData.phoneNumber.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        newErrors.phoneNumber = 'Phone number must be at least 10 digits';
      } else if (digitsOnly.length > 15) {
        newErrors.phoneNumber = 'Phone number is too long';
      }
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
      const response = await fetch('http://localhost:5001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          role: 'admin',         // Hardcoded role
          region_id: 1           // Hardcoded region_id
        })
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/login');
      } else {
        setErrors({ general: data.error || 'Signup failed' });
      }
    } catch (err) {
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
            <h1 className="auth-title">Sign up</h1>
            <p className="auth-subtitle">Enter your credentials to begin.</p>
            
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                  />
                  {errors.fullName && (
                    <div className="error-message">
                      {errors.fullName}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="companyName" className="form-label">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter your company name"
                    className={`form-input ${errors.companyName ? 'error' : ''}`}
                  />
                  {errors.companyName && (
                    <div className="error-message">
                      {errors.companyName}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
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
                  <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                  />
                  {errors.phoneNumber && (
                    <div className="error-message">
                      {errors.phoneNumber}
                    </div>
                  )}
                </div>
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

              <div className="form-group">
                <label className="checkbox-container">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  I agree with privacy statement and disclaimer
                </label>
              </div>

              <button 
                type="submit" 
                className={`auth-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <div className="auth-footer">
              <p className="signup-text">
                Already have an account? <Link to="/login" className="signup-link">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
