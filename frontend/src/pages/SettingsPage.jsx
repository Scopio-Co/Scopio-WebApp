import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import './SettingsPage.css';
import defaultProfileAvatar from '../assets/img/profilePic (2).png';

const defaultForm = {
  fullName: '',
  username: '',
  college: '',
  bio: '',
  photoFile: null,
  photoPreview: ''
};

const SettingsPage = () => {
  const [formData, setFormData] = useState(defaultForm);
  const [initialFormData, setInitialFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [originalData, setOriginalData] = useState({
    fullName: '',
    username: '',
    college: '',
    bio: '',
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await api.get('/api/auth/profile/');
        const user = response?.data || {};
        const loadedForm = {
          fullName: user.full_name || '',
          username: user.username || '',
          college: user.college || '',
          bio: user.bio || '',
          photoFile: null,
          photoPreview: user.profile_image_url || defaultProfileAvatar
        };
        setFormData(loadedForm);
        setInitialFormData(loadedForm);
        setOriginalData({
          fullName: loadedForm.fullName,
          username: loadedForm.username,
          college: loadedForm.college,
          bio: loadedForm.bio,
        });
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setErrorMessage('');
    setSuccessMessage('');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (formData.photoPreview && formData.photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.photoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setErrorMessage('');
    setSuccessMessage('');
    setFormData((prev) => ({
      ...prev,
      photoFile: file,
      photoPreview: previewUrl
    }));
  };

  const handleCancel = () => {
    setErrorMessage('');
    setFormData(initialFormData);
    setSuccessMessage('');
  };

  const getErrorText = (data) => {
    if (!data) return 'Unable to save profile. Please try again.';
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;

    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];
    if (Array.isArray(firstValue) && firstValue.length) return firstValue[0];
    if (typeof firstValue === 'string') return firstValue;
    return 'Unable to save profile. Please check your input.';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      let response;

      if (formData.photoFile) {
        const multipartPayload = new FormData();
        multipartPayload.append('full_name', formData.fullName.trim());
        multipartPayload.append('username', formData.username.trim());
        multipartPayload.append('college', formData.college.trim());
        multipartPayload.append('bio', formData.bio.trim());
        multipartPayload.append('profile_image', formData.photoFile);
        response = await api.patch('/api/auth/profile/', multipartPayload);
      } else {
        response = await api.patch('/api/auth/profile/', {
          full_name: formData.fullName.trim(),
          username: formData.username.trim(),
          college: formData.college.trim(),
          bio: formData.bio.trim(),
        });
      }

      const saved = response?.data || {};
      const rawImageUrl = saved.profile_image_url || '';
      const imageUrl = rawImageUrl
        ? (rawImageUrl.startsWith('data:')
          ? rawImageUrl
          : `${rawImageUrl}${rawImageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`)
        : (formData.photoPreview || defaultProfileAvatar);

      const updatedForm = {
        fullName: saved.full_name || formData.fullName,
        username: saved.username || formData.username,
        college: saved.college || '',
        bio: saved.bio || '',
        photoFile: null,
        photoPreview: imageUrl,
      };

      setFormData(updatedForm);
      setInitialFormData(updatedForm);
      setOriginalData({
        fullName: updatedForm.fullName,
        username: updatedForm.username,
        college: updatedForm.college,
        bio: updatedForm.bio,
      });

      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: {
          full_name: updatedForm.fullName,
          username: updatedForm.username,
          college: updatedForm.college,
          bio: updatedForm.bio,
          profile_image_url: imageUrl,
        }
      }));

      setSuccessMessage('Profile updated successfully.');
    } catch (err) {
      console.error('Failed to save profile settings:', err);
      setErrorMessage(getErrorText(err?.response?.data));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (formData.photoPreview && formData.photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(formData.photoPreview);
      }
    };
  }, [formData.photoPreview]);

  return (
    <div className="settings-page">
      <div className="profile-settings-card">
        <h1 className="settings-title">Profile Settings</h1>

        {loading ? (
          <p className="settings-status">Loading profile...</p>
        ) : (
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="photo-row">
              <div className="profile-photo" aria-hidden="true">
                {formData.photoPreview ? (
                  <img src={formData.photoPreview} alt="Profile preview" />
                ) : (
                  <span>Profile Photo</span>
                )}
              </div>
              <button
                type="button"
                className="settings-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden-file-input"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="settings-field-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={originalData.fullName || 'Enter full name'}
              />
            </div>

            <div className="settings-field-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={originalData.username || 'Enter username'}
              />
            </div>

            <div className="settings-field-group">
              <label htmlFor="college">College / Organization</label>
              <input
                id="college"
                name="college"
                type="text"
                value={formData.college}
                onChange={handleInputChange}
                placeholder={originalData.college || 'Enter college or organization'}
              />
            </div>

            <div className="settings-field-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder={originalData.bio || 'Write a short bio'}
              />
            </div>

            {errorMessage && <p className="settings-error">{errorMessage}</p>}
            {successMessage && <p className="settings-success">{successMessage}</p>}

            <div className="settings-actions">
              <button type="button" className="settings-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="settings-btn primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;