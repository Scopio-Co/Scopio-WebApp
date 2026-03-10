import React, { useEffect } from 'react';
import './Pagination.css';

const Pagination = ({ currentPage = 1, totalPages, totalItems = 0, itemsPerPage = 10, onPageChange = () => {} }) => {
  // Backwards-compatible: if totalPages provided, use it; otherwise compute from totalItems/itemsPerPage
  const pagesCount = typeof totalPages === 'number' && totalPages > 0
    ? totalPages
    : Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1)));
  const pages = Array.from({ length: pagesCount }, (_, i) => i + 1);

  // Disable automatic scroll restoration globally on mount
  useEffect(() => {
    try {
      if (history && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
    } catch (err) {
      console.warn('Could not set scroll restoration:', err);
    }
  }, []);

  const handlePageClick = (e, p) => {
    // Prevent default behavior
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    // Don't do anything if already on this page
    if (p === currentPage) {
      return;
    }

    // Scroll to top immediately BEFORE state change
    const scrollToTopNow = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      // Also scroll main-content container if it exists
      const mainEl = document.querySelector('.main-content');
      if (mainEl) mainEl.scrollTop = 0;
    };

    scrollToTopNow();

    // Call parent's page change handler
    onPageChange(p);

    // Scroll again after render with multiple attempts to override any interference
    requestAnimationFrame(() => {
      scrollToTopNow();
      requestAnimationFrame(() => {
        scrollToTopNow();
        setTimeout(scrollToTopNow, 0);
      });
    });
  };

  return (
    <div className="pagination">
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
          onClick={(e) => handlePageClick(e, p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
