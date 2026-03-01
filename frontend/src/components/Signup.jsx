import React, { useState, useEffect } from 'react';
import './Auth.css';
import Login from './Login';
import linkedinIcon from '../assets/img/Linkedin.svg';
import googleIcon from '../assets/img/Google.svg';
import githubIcon from '../assets/img/Github.svg';
import api, { fetchCsrfToken } from '../api';

const Signup = ({ onSwitchToLogin, onSwitchToWelcome }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    gender: 'male'
  });

  const [errors, setErrors] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
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
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // Call the registration API
        const response = await api.post('/api/user/register/', {
          username: formData.username,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password,
        });
        
        console.log('Signup successful:', response.data);
        
        // Show success toast
        setToast({ visible: true, message: 'Account created successfully!' });
        
        // Wait 1 second before navigating
        setTimeout(() => {
          setToast({ visible: false, message: '' });
          if (typeof onSwitchToWelcome === 'function') {
            onSwitchToWelcome();
          } else if (typeof onSwitchToLogin === 'function') {
            onSwitchToLogin();
          }
        }, 1000);
      } catch (error) {
        console.error('Signup failed:', error.response?.data);
        
        // Handle backend validation errors
        if (error.response?.data?.errors) {
          const backendErrors = {};
          const errorData = error.response.data.errors;
          
          // Map backend field names to frontend field names
          if (errorData.username) {
            backendErrors.username = Array.isArray(errorData.username) 
              ? errorData.username[0] 
              : errorData.username;
          }
          if (errorData.email) {
            backendErrors.email = Array.isArray(errorData.email) 
              ? errorData.email[0] 
              : errorData.email;
          }
          if (errorData.password) {
            backendErrors.password = Array.isArray(errorData.password) 
              ? errorData.password[0] 
              : errorData.password;
          }
          if (errorData.first_name) {
            backendErrors.firstName = Array.isArray(errorData.first_name) 
              ? errorData.first_name[0] 
              : errorData.first_name;
          }
          if (errorData.last_name) {
            backendErrors.lastName = Array.isArray(errorData.last_name) 
              ? errorData.last_name[0] 
              : errorData.last_name;
          }
          
          setErrors(backendErrors);
        } else if (error.response?.data?.error) {
          // General error message
          setErrors({ 
            general: error.response.data.error 
          });
        } else {
          setErrors({ 
            general: 'Signup failed. Please try again.' 
          });
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
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

  const handleLoginSuccess = () => {
    console.log('✓ [Signup] Login success callback triggered');
    console.log('✓ [Signup] Verifying tokens in storage:', {
      access: !!localStorage.getItem('access'),
      refresh: !!localStorage.getItem('refresh')
    });
    
    // Show toast notification
    setToast({ visible: true, message: 'Login successful!' });
    
    // Hide login modal immediately
    setShowLoginModal(false);
    
    // Call parent's callback to update auth state - THIS MUST HAPPEN IMMEDIATELY
    if (typeof onSwitchToWelcome === 'function') {
      console.log('✓ [Signup] Calling onSwitchToWelcome callback');
      onSwitchToWelcome();
    }
    
    // Hide toast after delay (non-blocking, optional)
    setTimeout(() => {
      setToast({ visible: false, message: '' });
    }, 2000);
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-form-section">
          <form className="auth-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="error-message general-error" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee', borderRadius: '4px', color: '#c00' }}>
                {errors.general}
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              <div className="form-group half-width">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
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

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="gender-selection">
              <div className="gender-group">
                <input
                  type="radio"
                  id="male"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleInputChange}
                />
                <label htmlFor="male">Male</label>
              </div>
              <div className="gender-group">
                <input
                  type="radio"
                  id="female"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleInputChange}
                />
                <label htmlFor="female">Female</label>
              </div>
            </div>

            <button type="submit" className="auth-button primary" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="social-login">
                <div className="social-media">
              <button
                type="button"
                className="social-button linkedin"
                onClick={() => handleSocialLogin('LinkedIn')}
              >
                <img src={linkedinIcon} alt="LinkedIn" className='social-icon'/>
              </button>
              <button
                type="button"
                className="social-button google"
                onClick={() => handleSocialLogin('Google')}
              >
                <img src={googleIcon} alt="Google" className='social-icon'/>
              </button>
              <button
                type="button"
                className="social-button github"
                onClick={() => handleSocialLogin('GitHub')}
              >
                <img src={githubIcon} alt="GitHub" className="social-icon" />
              </button>
              </div>
              <button
                type="button"
                className="auth-button secondary"
                onClick={() => setShowLoginModal(true)}
              >
                Got one?
              </button>
            </div>
          </form>
        </div>

        <div className="auth-brand-section">
          <div className="brand-content">
            <h1 className="brand-title">SCOPIO.</h1>
          </div>
        </div>
      </div>
      
      {/* Login Modal Overlay */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
      {/* Toast notification */}
      {toast.visible && (
        <div className={`toast ${toast.visible ? '' : 'hide'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Signup;
