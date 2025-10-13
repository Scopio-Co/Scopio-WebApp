import React from 'react';
import './HeroCard.css';
import heroImage from '../assets/Hero Card img.png';

const HeroCard = ({ 
  title = "Kick Like Benz", 
  description = "The 34-year-old Carlsen made the revelation on X as he shared the screenshots of his conversation with ChatGPT. He captioned the post: \"I sometimes get bored while travelling.\" In the first screenshot, ChatGPT can be seen conceding defeat as it surrendered to Carlsen with the message: \"All my pawns are gone. You haven't lost a single piece. You fulfilled your win condition perfectly... As agreed, I resign.\"",
  rating = 4,
  maxRating = 5
}) => {
  const renderStars = (rating, maxRating) => {
    return Array.from({ length: maxRating }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : 'empty'}`}>
        ⭐
      </span>
    ));
  };

  return (
    <div className="hero-card">
      {/* Visual Section */}
      <div className="hero-visual">
        <img 
          src={heroImage} 
          alt="Hero Card Visual" 
          className="hero-image"
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
            <div className="rating-stars">
              {renderStars(rating, maxRating)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCard;