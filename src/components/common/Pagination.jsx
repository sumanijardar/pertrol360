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
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100, 500]
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
    <div className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2 bg-card border-t border-border text-xs select-none">
      {/* Left: Range text & Page Size selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-muted-foreground font-medium text-[11.5px]">
          Showing <span className="font-semibold text-foreground">{startItem}</span> to{' '}
          <span className="font-semibold text-foreground">{endItem}</span> of{' '}
          <span className="font-semibold text-foreground">{totalItems}</span> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-6 rounded border border-border bg-background px-1.5 text-[11px] font-medium text-foreground outline-none cursor-pointer focus:ring-1 focus:ring-ring"
              style={{ width: 'auto' }}
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

      {/* Right: ShadCn Mira Pagination */}
      <nav aria-label="Table pagination" className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          className={`h-8 px-3 inline-flex items-center justify-center rounded-md border text-xs font-medium transition-colors ${currentPage <= 1
              ? 'border-border/40 text-muted-foreground/40 cursor-not-allowed bg-transparent'
              : 'border-border text-foreground hover:bg-accent cursor-pointer'
            }`}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="h-8 w-7 inline-flex items-center justify-center text-muted-foreground text-xs">
                  ...
                </span>
              );
            }

            const isActive = currentPage === page;
            return (
              <button
                key={page}
                className={`h-8 min-w-[32px] px-2.5 inline-flex items-center justify-center rounded-md text-xs font-medium transition-all ${isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs border border-primary'
                    : 'border border-border/80 text-foreground hover:bg-accent cursor-pointer'
                  }`}
                onClick={() => onPageChange && onPageChange(page)}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          className={`h-8 px-3 inline-flex items-center justify-center rounded-md border text-xs font-medium transition-colors ${currentPage >= totalPages
              ? 'border-border/40 text-muted-foreground/40 cursor-not-allowed bg-transparent'
              : 'border-border text-foreground hover:bg-accent cursor-pointer'
            }`}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
