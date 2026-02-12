import React, { useState } from 'react';
import './Auth.css';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        // Call Django JWT token endpoint
        const response = await api.post('/api/token/', {
          username: formData.username,
          password: formData.password
        });

        // Store tokens in localStorage
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);

        // Call success callback if provided
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } catch (error) {
        console.error('Login error:', error);
        if (error.response) {
          // Backend returned an error response
          setErrors({
            general: error.response.data.detail || 'Invalid username or password'
          });
        } else {
          // Network or other error
          setErrors({
            general: 'Unable to connect to server. Please try again.'
          });
        }
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // Add forgot password logic here
  };

  return (
    <div className="auth-container-login">
      <div className="auth-content-login">
        
          <div className="login-modal">
            <form className="auth-form login-form" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  {errors.general}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={errors.username ? 'error' : ''}
                  disabled={loading}
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  disabled={loading}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-options">
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="auth-button primary login-button" disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

          </div>
        </div>

        </div>
    
  );
};

export default Login;