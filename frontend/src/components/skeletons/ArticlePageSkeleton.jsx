import React from 'react';
import './ArticlePageSkeleton.css';

const ArticlePageSkeleton = () => {
  return (
    <div className="bento-grid-skeleton">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className={`bento-item-skeleton bento-item-${item}`}>
          <div className="skeleton-bento-image"></div>
          <div className="bento-overlay-skeleton">
            <div className="skeleton-bento-title"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArticlePageSkeleton;
