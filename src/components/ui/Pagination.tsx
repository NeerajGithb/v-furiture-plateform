import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationInfo } from '@/types/pagination';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  itemName?: string;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  itemName = 'items',
  isLoading = false,
}) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, limit, total, totalPages, hasNext, hasPrev } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const handlePrevious = () => { if (hasPrev && !isLoading) onPageChange(page - 1); };
  const handleNext = () => { if (hasNext && !isLoading) onPageChange(page + 1); };
  const handlePageClick = (targetPage: number) => {
    if (targetPage !== page && !isLoading) onPageChange(targetPage);
  };

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg px-5 py-3">
      <div className="flex items-center justify-between">
        {/* Info */}
        <p className="text-[12px] text-[#9CA3AF] font-medium">
          Showing{' '}
          <span className="font-semibold text-[#374151]">{startItem}</span>
          {' '}–{' '}
          <span className="font-semibold text-[#374151]">{endItem}</span>
          {' '}of{' '}
          <span className="font-semibold text-[#374151]">{total}</span>
          {' '}{itemName}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Previous */}
          <button
            onClick={handlePrevious}
            disabled={!hasPrev || isLoading}
            aria-label="Previous page"
            className="
              flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium
              border border-[#E5E7EB] text-[#555555] rounded-md bg-white
              hover:bg-[#F8F9FA] hover:text-[#111111] hover:border-[#D1D5DB]
              disabled:opacity-40 disabled:cursor-not-allowed transition-all
            "
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>

          {/* Page numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((pageNum, index) =>
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-[12px] text-[#9CA3AF]">
                  …
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => handlePageClick(pageNum as number)}
                  disabled={isLoading}
                  aria-label={`Page ${pageNum}`}
                  aria-current={pageNum === page ? 'page' : undefined}
                  className={`
                    min-w-[30px] px-2.5 py-1.5 text-[12px] font-medium rounded-md transition-all
                    ${pageNum === page
                      ? 'bg-[#111111] text-white'
                      : 'bg-white border border-[#E5E7EB] text-[#555555] hover:bg-[#F8F9FA] hover:text-[#111111] hover:border-[#D1D5DB]'
                    }
                    disabled:cursor-not-allowed
                  `}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>

          {/* Mobile */}
          <span className="sm:hidden px-3 py-1.5 text-[12px] font-medium text-[#6B7280]">
            {page} / {totalPages}
          </span>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={!hasNext || isLoading}
            aria-label="Next page"
            className="
              flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium
              border border-[#E5E7EB] text-[#555555] rounded-md bg-white
              hover:bg-[#F8F9FA] hover:text-[#111111] hover:border-[#D1D5DB]
              disabled:opacity-40 disabled:cursor-not-allowed transition-all
            "
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};