import React from 'react';
import './LearningPageSkeleton.css';

const LearningPageSkeleton = () => {
  return (
    <div className="learning-page-skeleton">
      <div className="learning-page-content-skeleton">
        {/* Learning Design Container Skeleton */}
        <div className="learning-design-container-skeleton">
          <div className="course-grid-skeleton">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="course-card-horizontal-skeleton">
                <div className="course-image-card-skeleton">
                  <div className="skeleton-course-img skeleton-shimmer"></div>
                  <div className="skeleton-continue-wrapper">
                    <div className="skeleton-continue-btn"></div>
                  </div>
                </div>
                <div className="course-info-skeleton">
                  <div className="skeleton-course-title"></div>
                  <div className="course-progress-skeleton">
                    <div className="skeleton-progress-text"></div>
                    <div className="skeleton-progress-bar"></div>
                  </div>
                  <div className="course-author-skeleton">
                    <div className="author-section-skeleton">
                      <div className="skeleton-avatar"></div>
                      <div className="author-info-skeleton">
                        <div className="skeleton-author-name"></div>
                        <div className="skeleton-author-title"></div>
                      </div>
                    </div>
                    <div className="skeleton-rating"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="pagination-skeleton">
          <div className="skeleton-pagination-item"></div>
          <div className="skeleton-pagination-item"></div>
          <div className="skeleton-pagination-item"></div>
          <div className="skeleton-pagination-item"></div>
          <div className="skeleton-pagination-item"></div>
        </div>
      </div>
    </div>
  );
};

export default LearningPageSkeleton;
