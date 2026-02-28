import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseCard.css';
import RatingComponent from './RatingComponent';
import defaultCourseImage from '../assets/img/course_card.webp';

const CourseCard = ({ 
  id,
  image = defaultCourseImage, 
  title = "Mangal Sutra - Introduction to run longer",
  duration = "5 hours, 48 minutes",
  rating = 4.7,
  description = "Robust trainig of how to run longer with your mangal sutra. Complete beginners guide to cover long distances within limited stamina. Holding the mangal sutra is also covered in this course.",
  progress = 80,
  authorName = "Ashva Rishemh",
  authorTitle = "Lover @Kanyakumari",
  imageFilter = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Position the overlay centered horizontally over the button
      // and vertically anchored near the button so it appears close to the card.
      const centerX = rect.left + rect.width / 2;
      const anchorTop = rect.top; // rect.top is relative to viewport; overlay is fixed
      setPosition({
        top: anchorTop,
        left: centerX
      });
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  const courseData = {
    id,
    image,
    title,
    duration,
    rating,
    description,
    progress,
    authorName,
    authorTitle
  };

  return (
    <div className={`course-card-component ${isExpanded ? 'expanded' : ''}`}>
      {/* Expanded Info Card */}
      {isExpanded && (
        <div 
          className="info-card-overlay"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -110%)'
          }}
        >
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
      <div className="course-card-main" onClick={() => id && navigate(`/course/${id}`)} style={{ cursor: id ? 'pointer' : 'default' }}>
        <div className="card-image-section">
          <img
            src={image}
            alt={title}
            className="card-course-img"
            style={imageFilter ? { filter: imageFilter } : undefined}
          />
        </div>
        <div className="card-content-section">
          <h3 className="card-course-title">{title}</h3>
          <div className="card-author-section">
            <div className="author-section">
                    <div className="author-avatar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
  <circle cx="17" cy="17" r="14.5" fill="white" stroke="#8A8A8A" strokeWidth="5"/>
</svg>
                    </div>
                    <div className="author-info">
                      <span className="author-name">{authorName}</span>
                      <span className="author-title">{authorTitle}</span>
                    </div>
            </div>
            <button ref={buttonRef} className="card-info-btn" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <span className="info-icon-text">i</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
