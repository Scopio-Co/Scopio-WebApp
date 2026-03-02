import React from 'react';
import './ExplorePageSkeleton.css';

const ExplorePageSkeleton = () => {
  return (
    <div className="explore-page-skeleton">
      {/* Main Content */}
      <div className="learning-page-content-skeleton">
        {/* Course Sections */}
        <div className="explore-sections-skeleton">
          {[1, 2, 3, 4, 5, 6].map((section) => (
            <div key={section} className="explore-section-skeleton">
              <div className="skeleton-section-title"></div>
              <div className="section-container-skeleton">
                <div className="skeleton-arrow-btn"></div>
                <div className="courses-scroll-container-skeleton">
                  <div className="courses-row-skeleton">
                    {[1, 2, 3, 4, 5, 6].map((card) => (
                      <div key={card} className="course-card-skeleton-explore">
                        <div className="course-card-image-skeleton skeleton-shimmer"></div>
                        <div className="course-card-content-skeleton">
                          <div className="skeleton-card-title"></div>
                          <div className="skeleton-card-duration"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="skeleton-arrow-btn"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExplorePageSkeleton;

