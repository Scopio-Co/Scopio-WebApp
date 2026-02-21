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
        // Call the login API
        await login(formData.emailOrUsername, formData.password);
        console.log('Login successful');
        
        // notify parent about successful login so it can show toast / navigate
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess();
        }
      } catch (error) {
        console.error('Login failed:', error);
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
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-options">
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={handleForgotPassword} disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log in'}
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="auth-button primary login-button">
                Log in
              </button>

              <div className="social-login">
                <div className="social-media">
                  <button
                    type="button"
                    className="social-button google"
                    onClick={() => handleSocialLogin('Google')}
                  >
                    <img src={googleIcon} alt="Google" className='social-icon'/>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>

        </div>
    
  );
};

export default Login;