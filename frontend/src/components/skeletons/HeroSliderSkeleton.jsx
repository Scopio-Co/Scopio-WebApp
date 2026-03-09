import React from 'react';
import './HeroSliderSkeleton.css';

const HeroSliderSkeleton = ({ count = 3 }) => {
  return (
    <div className="hero-slider-skeleton-track" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="hero-slider-skeleton-card" key={`hero-skeleton-${index}`}>
          <div className="hero-slider-skeleton-image" />
          <div className="hero-slider-skeleton-content">
            <div className="hero-slider-skeleton-title" />
            <div className="hero-slider-skeleton-line" />
            <div className="hero-slider-skeleton-line short" />
            <div className="hero-slider-skeleton-footer">
              <div className="hero-slider-skeleton-rating" />
              <div className="hero-slider-skeleton-button" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroSliderSkeleton;
