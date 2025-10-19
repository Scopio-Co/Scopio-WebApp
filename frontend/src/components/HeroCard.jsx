import React from 'react';
import './HeroCard.css';
// Import with proper path resolution
import heroImage from '../assets/img/Hero Card img.png';

const HeroCard = ({ 
  title = "Kick Like Benz", 
  description = "The 34-year-old Carlsen made the revelation on X as he shared the screenshots of his conversation with ChatGPT. He captioned the post: \"I sometimes get bored while travelling.\" In the first screenshot, ChatGPT can be seen conceding defeat as it surrendered to Carlsen with the message: \"All my pawns are gone. You haven't lost a single piece. You fulfilled your win condition perfectly... As agreed, I resign.\"",
  rating = 4,
  maxRating = 5,
  image = heroImage || "/src/assets/img/Hero Card img.png" // Fallback path
}) => {
  const renderStars = (rating, maxRating) => {
    return Array.from({ length: maxRating }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : 'empty'}`}>
        {index < rating ? (
          // Filled Star
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
            <path d="M3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z" fill="#FFD900"/>
          </svg>
        ) : (
          // Empty Star
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
  <path d="M6.85 14.825L10 12.925L13.15 14.85L12.325 11.25L15.1 8.85L11.45 8.525L10 5.125L8.55 8.5L4.9 8.825L7.675 11.25L6.85 14.825ZM3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z" fill="#1D1B20"/>
  <path d="M6.85 14.825L10 12.925L13.15 14.85L12.325 11.25L15.1 8.85L11.45 8.525L10 5.125L8.55 8.5L4.9 8.825L7.675 11.25L6.85 14.825ZM3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z" fill="#FFD900"/>
</svg>
        )}
      </span>
    ));
  };

  return (
    <div className="hero-card">
      {/* Visual Section */}
      <div className="hero-visual">
        <img 
          src={image} 
          alt="Hero Card Visual" 
          className="hero-image"
          onError={(e) => {
            console.error('Image failed to load:', e.target.src);
            e.target.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', image);
          }}
        />
      </div>
      
      {/* Content Section */}
      <div className="hero-content">
        <h2 className="hero-title">{title}</h2>
        <p className="hero-description">{description}</p>
        
        <div className="hero-actions">
          <button className="explore-btn">Explore</button>
          
          <div className="reviews-section">
            <span className="reviews-text">Reviews</span>
            <div className="rating-display">
              {/* Full star display for larger containers */}
              <div className="rating-stars full-stars">
                {renderStars(rating, maxRating)}
              </div>
              
              {/* Compact display for smaller containers */}
              <div className="rating-compact">
                <span className="rating-number">{rating}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 19" fill="none" className="single-star">
                  <path d="M3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z" fill="#FFD900"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCard;