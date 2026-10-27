import React from 'react';

/**
 * PATROL360 Universal Bootstrap 5 Table Pagination Component
 * 
 * @param {number} currentPage - Currently active page (1-indexed)
 * @param {number} totalItems - Total number of items
 * @param {number} pageSize - Number of items displayed per page
 * @param {Function} onPageChange - Callback when page changes (newPage) => void
 * @param {Function} [onPageSizeChange] - Optional callback when page size changes (newSize) => void
 * @param {Array<number>} [pageSizeOptions=[5, 10, 20, 50]] - Page size choices
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50]
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  // Generate visible page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 bg-white border-top">
      {/* Left: Range text & Page Size selector */}
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <span className="text-dark small fw-semibold">
          Showing <strong className="text-black fw-bold">{startItem}</strong> to{' '}
          <strong className="text-black fw-bold">{endItem}</strong> of{' '}
          <strong className="text-black fw-bold">{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-semibold">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="form-select form-select-sm py-0 px-2 fw-bold text-dark border-secondary-subtle"
              style={{ width: 'auto', minWidth: '65px', height: '28px', fontSize: '11px' }}
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Bootstrap 5 Pagination List */}
      <nav aria-label="Table pagination">
        <ul className="pagination pagination-sm mb-0">
          {/* Previous Button */}
          <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
            <button
              className="page-link text-black fw-semibold"
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              style={{ cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
          </li>

          {/* Number Buttons */}
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <li key={`ellipsis-${idx}`} className="page-item disabled">
                  <span className="page-link text-muted">...</span>
                </li>
              );
            }

            const isActive = currentPage === page;
            return (
              <li key={page} className={`page-item ${isActive ? 'active' : ''}`}>
                <button
                  className={`page-link fw-bold ${isActive ? 'bg-primary border-primary text-white' : 'text-black'}`}
                  onClick={() => onPageChange && onPageChange(page)}
                  style={{ minWidth: '32px', textAlign: 'center' }}
                >
                  {page}
                </button>
              </li>
            );
          })}

          {/* Next Button */}
          <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link text-black fw-semibold"
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              style={{ cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
