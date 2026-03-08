import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroCard.css';
import RatingComponent from './RatingComponent';
import heroImage from '../assets/img/Hero Card img.png';

const HeroCard = ({
  title = "Kick Like Benz",
  description = "The 34-year-old Carlsen made the revelation on X as he shared the screenshots of his conversation with ChatGPT. He captioned the post: \"I sometimes get bored while travelling.\" In the first screenshot, ChatGPT can be seen conceding defeat as it surrendered to Carlsen with the message: \"All my pawns are gone. You haven't lost a single piece. You fulfilled your win condition perfectly... As agreed, I resign.\"",
  rating = 4.6,
  image = heroImage
}) => {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // navigate without adding a new history entry and scroll to top
    navigate('/explore', { replace: true });
    const mainEl = document.querySelector('.main-content');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(e);
    }
  };

  return (
    <div
      className="hero-card"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      {/* 16:9 Image Banner */}
      <div className="hero-visual">
        <img
          src={image}
          alt={title}
          className="hero-image"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="hero-visual-overlay" />
      </div>

      {/* Content */}
      <div className="hero-content">
        <h2 className="hero-title">{title}</h2>
        <p className="hero-description">{description}</p>

        <div className="hero-actions">
          <RatingComponent rating={rating} />
          <button
            className="explore-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              navigate('/explore', { replace: true });
              const mainEl = document.querySelector('.main-content');
              if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'auto' });
            }}
          >
            Explore
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroCard;