import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './ArticleDetailPage.css';

const ArticleDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { articleId } = useParams();
  const article = location.state?.article;

  useEffect(() => {
    try {
      const container = document.querySelector('.main-content');
      if (container && typeof container.scrollTo === 'function') {
        container.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        window.scrollTo(0, 0);
      }
    } catch (e) {
      // noop in non-browser environments
    }
  }, []);

  if (!article) {
    return (
      <div className="article-detail-page">
        <div className="article-detail-error">
          <h2>Article not found</h2>
          <button onClick={() => navigate('/articles')} className="back-button">
            ← Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      <button onClick={() => navigate('/articles')} className="back-top-right" aria-label="Back to articles">
        ← Back to Articles
      </button>
      <div className="article-detail-container">
        <div className="article-detail-content">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
