import React, { useState } from 'react';
import './CourseCard.css';
import RatingComponent from './RatingComponent';
import defaultCourseImage from '../assets/img/course card.jpg';

const CourseCard = ({ 
  image = defaultCourseImage, 
  title = "Mangal Sutra - Introduction to run longer",
  duration = "5 hours, 48 minutes",
  rating = 4.7,
  description = "Robust trainig of how to run longer with your mangal sutra. Complete beginners guide to cover long distances within limited stamina. Holding the mangal sutra is also covered in this course.",
  progress = 80,
  authorName = "Ashva Rishemh",
  authorTitle = "Lover @Kanyakumari"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`course-card-component ${isExpanded ? 'expanded' : ''}`}>
      {/* Expanded Info Card */}
      {isExpanded && (
        <div className="info-card-overlay">
          <div className="info-card">
            <div className="info-card-content">
              <h3 className="info-card-title">{title}</h3>
              <p className="info-card-duration">{duration}</p>
              <div className="info-card-rating">
                <RatingComponent rating={rating} />
              </div>
              <p className="info-card-description">{description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Course Card */}
      <div className="course-card-main">
        <div className="card-image-section">
          <img src={image} alt={title} className="card-course-img" />
        </div>
        <div className="card-content-section">
          <h3 className="card-course-title">{title}</h3>
          <div className="card-author-section">
            <div className="card-author-info">
              <div className="card-avatar-circle">
                <span className="card-avatar-initial">{authorName.charAt(0)}</span>
              </div>
              <div className="card-author-details">
                <span className="card-author-name">{authorName}</span>
                <span className="card-author-title">{authorTitle}</span>
              </div>
            </div>
            <button className="card-info-btn" onClick={toggleExpanded}>
              <span className="info-icon-text">i</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
