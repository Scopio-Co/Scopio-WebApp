import React, { useState, useEffect } from 'react';
import './Auth.css';
import googleIcon from '../assets/img/Google.svg';
import { login, fetchCsrfToken, getBackendBaseUrl } from '../api';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

        // Ensure the main content scrolls to top after login
        const mainEl = document.querySelector('.main-content');
        if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'auto' });
      } catch (error) {
        console.error('❌ [Login] Login failed:', error);
        // Display actionable message for network-level failures.
        const isNetworkError = !error.response;
        const errorMessage = isNetworkError
          ? 'Unable to reach the authentication server. Please refresh and try again. If it keeps failing, use Google sign-in or confirm the backend API URL is HTTPS.'
          : error.response?.data?.detail ||
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
      const backendURL = getBackendBaseUrl();
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
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'error' : ''}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
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