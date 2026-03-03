import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage = 1, totalPages, totalItems = 0, itemsPerPage = 10, onPageChange = () => {} }) => {
  // Backwards-compatible: if totalPages provided, use it; otherwise compute from totalItems/itemsPerPage
  const pagesCount = typeof totalPages === 'number' && totalPages > 0
    ? totalPages
    : Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1)));
  const pages = Array.from({ length: pagesCount }, (_, i) => i + 1);

  return (
    <div className="pagination">
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
