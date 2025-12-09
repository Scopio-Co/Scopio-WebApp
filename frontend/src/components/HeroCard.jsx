import React from 'react';
import './HeroCard.css';
import RatingComponent from './RatingComponent';
// Import with proper path resolution
import heroImage from '../assets/img/Hero Card img.png';

const HeroCard = ({ 
  title = "Kick Like Benz", 
  description = "The 34-year-old Carlsen made the revelation on X as he shared the screenshots of his conversation with ChatGPT. He captioned the post: \"I sometimes get bored while travelling.\" In the first screenshot, ChatGPT can be seen conceding defeat as it surrendered to Carlsen with the message: \"All my pawns are gone. You haven't lost a single piece. You fulfilled your win condition perfectly... As agreed, I resign.\"",
  rating = 4.6,
  image = heroImage || "/src/assets/img/Hero Card img.png" // Fallback path
}) => {

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
          
          <RatingComponent rating={rating} />
        </div>
      </div>
    </div>
  );
};

export default HeroCard;