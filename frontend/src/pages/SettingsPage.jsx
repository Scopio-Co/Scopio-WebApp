import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css';
import Footer from '../components/Footer';
import api from '../api';
import profileAvatar from '../assets/img/profilePic (2).png';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewImage, setPreviewImage] = useState(profileAvatar);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    profile_picture: null
  });

  const [originalData, setOriginalData] = useState({});

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/auth/status/');
        const userData = response.data.user;
        
        const data = {
          username: userData.username || '',
          email: userData.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          profile_picture: null
        };
        
        setFormData(data);
        setOriginalData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setMessage({ type: 'error', text: 'Failed to load user data' });
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }

      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Check if anything changed
    const hasChanges = Object.keys(formData).some(key => {
      if (key === 'profile_picture') return formData[key] !== null;
      return formData[key] !== originalData[key];
    });

    if (!hasChanges) {
      setMessage({ type: 'info', text: 'No changes to save' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      // Prepare form data for multipart/form-data
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'profile_picture' && formData[key]) {
          data.append(key, formData[key]);
        } else if (key !== 'profile_picture' && formData[key] !== originalData[key]) {
          data.append(key, formData[key]);
        }
      });

      const response = await api.patch('/api/users/profile/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setOriginalData(formData);
      
      // Clear the file input after successful upload
      setFormData(prev => ({
        ...prev,
        profile_picture: null
      }));

      // Reload user data after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessage = Object.values(errors).flat().join(', ');
        setMessage({ type: 'error', text: errorMessage });
      } else {
        setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to update profile' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setPreviewImage(profileAvatar);
    setMessage({ type: '', text: '' });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
      setMessage({ type: 'info', text: 'Account deletion feature coming soon' });
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <div className="loading-spinner">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1 className="settings-title">Account Settings</h1>
          <p className="settings-subtitle">Manage your profile and account preferences</p>
        </div>

        {message.text && (
          <div className={`settings-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="settings-form">
          {/* Profile Picture Section */}
          <div className="settings-section">
            <h2 className="section-title">Profile Picture</h2>
            <div className="profile-picture-section">
              <div className="profile-picture-preview">
                <img src={previewImage} alt="Profile" className="preview-avatar" />
              </div>
              <div className="profile-picture-controls">
                <label htmlFor="profile-picture-input" className="upload-button">
                  Choose Photo
                </label>
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <p className="upload-hint">JPG, PNG or GIF. Max size 5MB</p>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="settings-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">First Name</label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label">Last Name</label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your last name"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="settings-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="action-button cancel-button"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="action-button save-button"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="settings-section danger-zone">
          <h2 className="section-title danger-title">Danger Zone</h2>
          <div className="danger-content">
            <div className="danger-info">
              <h3>Delete Account</h3>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="danger-button"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SettingsPage;
