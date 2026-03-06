import React from 'react';
import './CertificateModal.css';

const CertificateModal = ({ 
  isOpen, 
  onClose, 
  userName, 
  courseTitle, 
  completionDate, 
  certificateId,
  onDownload 
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleDownload = () => {
    if (onDownload) onDownload();
  };

  return (
    <div className="certificate-modal-overlay" onClick={onClose}>
      <div className="certificate-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="certificate-modal-close"
          onClick={onClose}
          aria-label="Close certificate"
        >
          ✕
        </button>

        <div className="certificate-modal-content">
          <div className="certificate-header">
            <h2 className="certificate-title">Certificate of Completion</h2>
            <p className="certificate-subtitle">Congratulations on completing your course!</p>
          </div>

          <div className="certificate-body">
            <div className="certificate-card">
              <div className="certificate-decoration-top"></div>
              
              <div className="certificate-info">
                <p className="certificate-label">This certifies that</p>
                <h3 className="certificate-name">{userName || 'Student Name'}</h3>
                
                <p className="certificate-label">has successfully completed</p>
                <h4 className="certificate-course">{courseTitle || 'Course Title'}</h4>
                
                <div className="certificate-details">
                  <div className="certificate-detail-item">
                    <span className="detail-label">Completion Date</span>
                    <span className="detail-value">{formatDate(completionDate)}</span>
                  </div>
                  <div className="certificate-detail-item">
                    <span className="detail-label">Certificate ID</span>
                    <span className="detail-value">{certificateId || 'CERT-XXXX-XXXX'}</span>
                  </div>
                </div>
              </div>

              <div className="certificate-decoration-bottom"></div>
            </div>
          </div>

          <div className="certificate-actions">
            <button
              type="button"
              className="certificate-download-btn"
              onClick={handleDownload}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
