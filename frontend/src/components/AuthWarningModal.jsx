import React from 'react';
import './AuthWarningModal.css';

const AuthWarningModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onLogin}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="auth-modal-title">Authentication Required</h2>
        <p className="auth-modal-message">
          Please log in to access this page and continue your learning journey.
        </p>
        <button className="auth-modal-button" onClick={onLogin}>
          Log In / Sign Up
        </button>
      </div>
    </div>
  );
};

export default AuthWarningModal;
