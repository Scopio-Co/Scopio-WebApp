import React from 'react';
import './CourseVideoSkeleton.css';

const CourseVideoSkeleton = () => {
  return (
    <div className="course-video-skeleton">
      <div className="course-video-container">
        {/* Header Skeleton */}
        <div className="course-video-header-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>

        {/* Main Content Grid */}
        <div className="course-content-grid-skeleton">
          {/* Top Container: Video and Lessons */}
          <div className="video-lessons-container-skeleton">
            {/* Video Player Skeleton */}
            <div className="video-player-skeleton skeleton-shimmer"></div>

            {/* Lessons Sidebar Skeleton */}
            <div className="lessons-sidebar-skeleton">
              <div className="lessons-header-skeleton">
                <div className="skeleton-text-md"></div>
                <div className="skeleton-text-sm"></div>
              </div>
              <div className="lessons-list-skeleton">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="lesson-item-skeleton">
                    <div className="skeleton-circle"></div>
                    <div className="lesson-content-skeleton">
                      <div className="skeleton-text-xs"></div>
                      <div className="skeleton-text-sm"></div>
                    </div>
                    <div className="lesson-meta-skeleton">
                      <div className="skeleton-text-xs"></div>
                      <div className="skeleton-text-xs"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Container: Discussions and Overview */}
          <div className="discussions-overview-container-skeleton">
            {/* Discussions Sidebar Skeleton */}
            <div className="discussions-sidebar-skeleton">
              <div className="discussions-header-skeleton">
                <div className="skeleton-text-md"></div>
                <div className="skeleton-text-xs"></div>
              </div>
              <div className="discussions-list-skeleton">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="discussion-item-skeleton">
                    <div className="discussion-header-skeleton">
                      <div className="skeleton-circle-sm"></div>
                      <div className="skeleton-text-sm"></div>
                    </div>
                    <div className="skeleton-text-lines">
                      <div className="skeleton-text-line"></div>
                      <div className="skeleton-text-line"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overview Container Skeleton */}
            <div className="overview-container-skeleton">
              <div className="course-tabs-skeleton">
                {[1, 2, 3, 4].map((tab) => (
                  <div key={tab} className="tab-skeleton"></div>
                ))}
              </div>
              <div className="tab-content-skeleton">
                <div className="skeleton-text-md"></div>
                <div className="skeleton-text-lines">
                  <div className="skeleton-text-line"></div>
                  <div className="skeleton-text-line"></div>
                  <div className="skeleton-text-line"></div>
                </div>
                <div className="skeleton-text-md" style={{marginTop: '2rem'}}></div>
                <div className="skeleton-text-lines">
                  <div className="skeleton-text-line"></div>
                  <div className="skeleton-text-line"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseVideoSkeleton;
