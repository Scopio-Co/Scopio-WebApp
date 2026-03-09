import React, { useEffect, useState } from 'react';
import api from '../api';
import './RatingComponent.css';

const ratingCache = new Map();
const inflightRatingRequests = new Map();
const RATING_CACHE_TTL_MS = 5 * 60 * 1000;

const RatingComponent = ({ 
  courseId = null,
  rating = 4.6,
  maxRating = 5,
  liveFetch = false,
  showReviewsText = true,
  reviewsLabel = "Reviews"
}) => {
  const normalizeRating = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(maxRating, parsed));
  };

  const [displayRating, setDisplayRating] = useState(() => normalizeRating(rating));

  useEffect(() => {
    setDisplayRating(normalizeRating(rating));
  }, [rating, maxRating]);

  useEffect(() => {
    if (!courseId || !liveFetch) return;

    let isMounted = true;

    const now = Date.now();
    const cached = ratingCache.get(courseId);
    if (cached && (now - cached.ts) < RATING_CACHE_TTL_MS) {
      setDisplayRating(cached.rating);
      return () => {
        isMounted = false;
      };
    }

    const fetchLiveCourseRating = async () => {
      try {
        let requestPromise = inflightRatingRequests.get(courseId);
        if (!requestPromise) {
          requestPromise = api.get(`/api/video/courses/${courseId}/`);
          inflightRatingRequests.set(courseId, requestPromise);
        }

        const response = await requestPromise;
        const data = response?.data || {};
        const totalRatings = Number(data.total_ratings ?? 0);
        const averageRating = Number(data.average_rating ?? data.rating ?? 0);
        const resolvedRating = totalRatings > 0 ? normalizeRating(averageRating) : 0;

        ratingCache.set(courseId, {
          rating: resolvedRating,
          ts: Date.now(),
        });

        if (!isMounted) return;
        setDisplayRating(resolvedRating);
      } catch (error) {
        // Keep fallback rating from props when live fetch fails.
      } finally {
        inflightRatingRequests.delete(courseId);
      }
    };

    fetchLiveCourseRating();

    return () => {
      isMounted = false;
    };
  }, [courseId, liveFetch]);

  const renderStar = (starIndex, rating) => {
    const starRating = rating - starIndex;
    const uniqueId = `star-${starIndex}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (starRating >= 1) {
      // Fully filled star
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
          <path d="M3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z" stroke="#FFD900" strokeWidth="2" fill="#FFD900"/>
        </svg>
      );
    } else if (starRating > 0) {
      // Partially filled star
      const fillPercentage = Math.max(0, Math.min(100, starRating * 100));
      
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
          <defs>
            <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset={`${fillPercentage}%`} stopColor="#FFD900" />
              <stop offset={`${fillPercentage}%`} stopColor="#ffffff04" />
            </linearGradient>
          </defs>
          <path d="M6.85 14.825L10 12.925L13.15 14.85L12.325 11.25L15.1 8.85L11.45 8.525L10 5.125L8.55 8.5L4.9 8.825L7.675 11.25L6.85 14.825ZM3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z" fill="none"/>
          <path d="M3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z" stroke="#FFD900" strokeWidth="2" fill={`url(#${uniqueId})`}/>
        </svg>
      );
    } else {
      // Empty star
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
          <path d="M6.85 14.825L10 12.925L13.15 14.85L12.325 11.25L15.1 8.85L11.45 8.525L10 5.125L8.55 8.5L4.9 8.825L7.675 11.25L6.85 14.825ZM3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z" fill="none"/>
          <path d="M3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z" stroke="#FFD900" strokeWidth="2" fill="none" />
        </svg>
      );
    }
  };

  const renderStars = (rating, maxRating) => {
    return Array.from({ length: maxRating }, (_, index) => (
      <span key={index} className={`star ${index < Math.ceil(rating) ? 'filled' : 'empty'}`}>
        {renderStar(index, rating)}
      </span>
    ));
  };

  return (
    <div className="reviews-section">
      {showReviewsText ? <span className="reviews-text">{reviewsLabel}</span> : null}
      <div className="rating-display">
        {/* Full star display for larger containers */}
        <div className="rating-stars full-stars">
          {renderStars(displayRating, maxRating)}
        </div>
        
        {/* Compact display for smaller containers */}
        <div className="rating-compact">
          <span className="rating-number">{displayRating.toFixed(1)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 19" fill="none" className="single-star">
            <path d="M3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z" fill="#FFD900"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default RatingComponent;