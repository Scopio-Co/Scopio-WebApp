import React, { useState, useEffect } from 'react';
import './Auth.css';
import googleIcon from '../assets/img/Google.svg';
import { login, fetchCsrfToken } from '../api';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch CSRF token when component mounts
  useEffect(() => {
    fetchCsrfToken();
  }, []);

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
    
    if (!formData.emailOrUsername) {
      newErrors.emailOrUsername = 'Email or Username is required';
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
      setIsLoading(true);
      try {
        console.log('🔐 [Login] Submitting login form...');
        // Call the login API
        await login(formData.emailOrUsername, formData.password);
        console.log('✓ [Login] Login API successful');
        
        // notify parent about successful login so it can show toast / navigate
        if (typeof onLoginSuccess === 'function') {
          console.log('✓ [Login] Calling onLoginSuccess callback');
          onLoginSuccess();
        } else {
          console.log('⚠️ [Login] onLoginSuccess callback not provided');
        }
      } catch (error) {
        console.error('❌ [Login] Login failed:', error);
        // Display error message from backend
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.error ||
                           'Login failed. Please try again.';
        
        setErrors({ 
          general: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // Add forgot password logic here
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      // Redirect to backend Google OAuth endpoint
      const backendURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      window.location.href = `${backendURL}/glogin/google/start/`;
    } else {
      console.log(`${provider} login not yet implemented`);
    }
  };

  return (
    <div className="auth-container-login">
      <div className="auth-content-login">
        
          <div className="login-modal">
            <form className="auth-form login-form" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="error-message general-error" style={{ marginBottom: '1rem', color: '#ff4444' }}>
                  {errors.general}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Email/Username</label>
                <input
                  type="text"
                  name="emailOrUsername"
                  value={formData.emailOrUsername}
                  onChange={handleInputChange}
                  className={errors.emailOrUsername ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.emailOrUsername && <span className="error-message">{errors.emailOrUsername}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-options">
                <button type="button" className="forgot-password-link"
                  onClick={handleForgotPassword} disabled={isLoading}>
                  Forgot Password?!
                </button>
              </div>

              <button type="submit" className="auth-button primary login-button" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>

            </form>

          </div>
        </div>

        </div>
    
  );
};

export default Login;