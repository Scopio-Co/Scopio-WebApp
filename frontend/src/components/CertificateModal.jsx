import React, { useRef } from 'react';
import './CertificateModal.css';
import certificateBg from '../assets/img/scopio/course-certificate.webp';

const CertificateModal = ({
  isOpen,
  onClose,
  userName = 'Student Name',
  courseTitle = 'Course Title',
  completionDate,
  certificateId,
  onDownload,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-GB');
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // split user name into first and rest so we can render on two lines
  const nameParts = (userName || 'Student Name').toString().trim().split(/\s+/);

  const handleDownload = () => {
    if (onDownload) { onDownload(); }
  };

  return (
    <div className="cert-overlay" onClick={onClose}>
      <div className="cert-wrapper" onClick={(e) => e.stopPropagation()}>

        {/* Close button */}
        <button className="cert-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Certificate visual */}
        <div className="cert-visual">
          <img src={certificateBg} alt="Certificate background" className="cert-bg" />

          {/* Left-half text overlay — matching the screenshot layout */}
          <div className="cert-text-layer">
            <p className="cert-intro">This is to proudly certify that</p>

            <h2 className="cert-name">
              {nameParts[0]}
              {nameParts.length > 1 && (
                <>
                  <br />
                  {nameParts.slice(1).join(' ')}
                </>
              )}
            </h2>

            <div className="cert-divider" />

            <p className="cert-body">
              Has successfully completed all the modules 
              in our video course of &ldquo;{courseTitle}&rdquo;
              on {formatDate(completionDate)}.
            </p>
          </div>
        </div>

        {/* Download button */}
        <div className="cert-actions">
          <button className="cert-download-btn" onClick={handleDownload}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
