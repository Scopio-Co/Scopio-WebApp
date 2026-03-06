import React from 'react';
import './WelcomeSkeleton.css';
import profilePic from '../../assets/img/profilePic.webp';

const WelcomeSkeleton = ({ displayName = 'User' }) => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Static Title - No Skeleton */}
        <h1 className="dashboard-title">Welcome Back!</h1>
        
        <div className="dashboard-grid">
          {/* Left Column with Stat Cards */}
          <div className='left-column'>
            {/* First Row of Stat Cards */}
            <div className="dashboard-column">
              <div className="stat-card">
                <div className="skeleton-icon-circle skeleton-shimmer"></div>
                <div className="stat-content">
                  <div className="skeleton-stat-value skeleton-shimmer"></div>
                  <div className="skeleton-stat-label skeleton-shimmer"></div>
                </div>
              </div>
              <div className="stat-card">
                <div className="skeleton-icon-circle skeleton-shimmer"></div>
                <div className="stat-content">
                  <div className="skeleton-stat-value skeleton-shimmer"></div>
                  <div className="skeleton-stat-label skeleton-shimmer"></div>
                </div>
              </div>
            </div>

            {/* Second Row of Stat Cards */}
            <div className="dashboard-column">
              <div className="stat-card">
                <div className="skeleton-icon-circle skeleton-shimmer"></div>
                <div className="stat-content">
                  <div className="skeleton-stat-value skeleton-shimmer"></div>
                  <div className="skeleton-stat-label skeleton-shimmer"></div>
                </div>
              </div>
              <div className="stat-card">
                <div className="skeleton-icon-circle skeleton-shimmer"></div>
                <div className="stat-content">
                  <div className="skeleton-stat-value skeleton-shimmer"></div>
                  <div className="skeleton-stat-label skeleton-shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column with Profile Card */}
          <div className="rightColumn">
            <div className="dashboard-column">
              <div className="profile-card">
                <div className="profile-wrapper">
                  <div className="skeleton-speed-text skeleton-blink"></div>
                  <div className="profile-image-container">
                    <img 
                      src={profilePic} 
                      alt="Profile" 
                      className="profile-image"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Row Skeleton */}
        <div className='calendar-row'>
          {/* Calendar Container Skeleton */}
          <div className="calendar-container">
            <div className="skeleton-calendar skeleton-shimmer"></div>
          </div>

          {/* Right Side Stats Containers */}
          <div className="calendar-side-stats">
            {/* Rank Container Skeleton */}
            <div className="rank-container">
              <div className="skeleton-rank-trophy skeleton-shimmer"></div>
              <div className="rank-content">
                <div className="skeleton-rank-title skeleton-shimmer"></div>
                <div className="skeleton-rank-value skeleton-shimmer"></div>
                <div className="skeleton-rank-subtitle skeleton-shimmer"></div>
              </div>
            </div>

            {/* Streak Countdown Container Skeleton */}
            <div className="streak-countdown-container">
              <div className="countdown-header">
                <div className="skeleton-countdown-title skeleton-shimmer"></div>
                <div className="skeleton-countdown-timer skeleton-shimmer"></div>
                <div className="skeleton-countdown-subtitle skeleton-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSkeleton;
