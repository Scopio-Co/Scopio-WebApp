import React, { useState } from 'react';
import './Auth.css';
import Login from './Login';
import linkedinIcon from '../assets/img/Linkedin.svg';
import googleIcon from '../assets/img/Google.svg';
import githubIcon from '../assets/img/Github.svg';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // Handle successful form submission
      console.log('Signup form submitted:', formData);
      // You can add your signup logic here (API call, etc.)
      // After successful signup, navigate to Welcome if parent provided handler
      if (typeof onSwitchToWelcome === 'function') {
        onSwitchToWelcome();
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`${provider} login clicked`);
    // Add social login logic here
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-form-section">
          <form className="auth-form" onSubmit={handleSubmit}>
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

            <button type="submit" className="auth-button primary">
              Create account
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
            
            <Login />
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
