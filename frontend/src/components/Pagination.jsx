import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage = 1, totalPages = 3, onPageChange = () => {} }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

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
