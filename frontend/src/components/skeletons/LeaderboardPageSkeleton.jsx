import React from 'react';
import './LeaderboardPageSkeleton.css';

const LeaderboardPageSkeleton = () => {
  return (
    <div className="leaderboard-page-skeleton">
      <div className="leaderboard-content-skeleton">
        {/* Leaderboard Table Skeleton */}
        <div className="leaderboard-table-skeleton">
          <div className="table-header-skeleton">
            <div className="skeleton-header-cell skeleton-shimmer"></div>
            <div className="skeleton-header-cell skeleton-shimmer"></div>
            <div className="skeleton-header-cell skeleton-shimmer"></div>
            <div className="skeleton-header-cell skeleton-shimmer"></div>
          </div>

          {/* Top 3 Rows with gradient backgrounds */}
          {[1, 2, 3].map((item) => (
            <div key={item} className={`leaderboard-row-skeleton top-${item}`}>
              <div className="skeleton-rank skeleton-shimmer"></div>
              <div className="skeleton-user-info">
                <div className="skeleton-avatar skeleton-shimmer"></div>
                <div className="skeleton-user-details">
                  <div className="skeleton-user-name skeleton-shimmer"></div>
                  <div className="skeleton-username skeleton-shimmer"></div>
                </div>
              </div>
              <div className="skeleton-score skeleton-shimmer"></div>
              <div className="skeleton-streak">
                <div className="skeleton-streak-badge skeleton-shimmer"></div>
                <div className="skeleton-streak-text skeleton-shimmer"></div>
              </div>
            </div>
          ))}

          {/* Regular Rows */}
          {[4, 5, 6, 7, 8, 9, 10].map((item) => (
            <div key={item} className="leaderboard-row-skeleton">
              <div className="skeleton-rank skeleton-shimmer"></div>
              <div className="skeleton-user-info">
                <div className="skeleton-avatar skeleton-shimmer"></div>
                <div className="skeleton-user-details">
                  <div className="skeleton-user-name skeleton-shimmer"></div>
                  <div className="skeleton-username skeleton-shimmer"></div>
                </div>
              </div>
              <div className="skeleton-score skeleton-shimmer"></div>
              <div className="skeleton-streak">
                <div className="skeleton-streak-badge skeleton-shimmer"></div>
                <div className="skeleton-streak-text skeleton-shimmer"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="leaderboard-pagination-skeleton">
          <div className="skeleton-pagination-item skeleton-shimmer"></div>
          <div className="skeleton-pagination-item skeleton-shimmer"></div>
          <div className="skeleton-pagination-item skeleton-shimmer"></div>
          <div className="skeleton-pagination-item skeleton-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPageSkeleton;
