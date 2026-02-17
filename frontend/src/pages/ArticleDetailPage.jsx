import React from 'react';
import './ArticleDetailPage.css';

const ArticleDetailPage = ({ article, onBack }) => {
  if (!article) {
    return (
      <div className="article-detail-page">
        <div className="article-detail-error">
          <h2>Article not found</h2>
          <button onClick={onBack} className="back-button">
            ← Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      <div className="article-detail-container">
        <div className="article-detail-content">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>

      <button
        className="back-fab"
        onClick={onBack}
        aria-label="Back to articles"
        title="Back to articles"
      >
        ←
      </button>
    </div>
  );
};

export default ArticleDetailPage;
