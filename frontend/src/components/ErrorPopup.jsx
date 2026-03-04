import React, { useEffect } from 'react';
import './ErrorPopup.css';

const ErrorPopup = ({ error, onClose }) => {
  useEffect(() => {
    if (error) {
      // Auto-close after 5 seconds if not closed manually
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, onClose]);

  if (!error) return null;

  return (
    <div className="error-popup-overlay">
      <div className="error-popup">
        <div className="error-popup-header">
          <h3>⚠️ Authentication Error</h3>
          <button className="error-popup-close" onClick={onClose}>✕</button>
        </div>
        <div className="error-popup-body">
          <p>{error}</p>
        </div>
        <div className="error-popup-footer">
          <button className="error-popup-button" onClick={onClose}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;
