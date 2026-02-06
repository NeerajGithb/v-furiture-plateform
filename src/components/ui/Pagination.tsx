import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationInfo } from '@/types/pagination';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  itemName?: string; // e.g., "users", "products", "orders"
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  itemName = "items",
  isLoading = false
}) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, limit, total, totalPages, hasNext, hasPrev } = pagination;
  
  const startItem = ((page - 1) * limit) + 1;
  const endItem = Math.min(page * limit, total);

  const handlePrevious = () => {
    if (hasPrev && !isLoading) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (hasNext && !isLoading) {
      onPageChange(page + 1);
    }
  };

  const handlePageClick = (targetPage: number) => {
    if (targetPage !== page && !isLoading) {
      onPageChange(targetPage);
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      if (page <= 3) {
        // Show first pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        // Show last pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Info */}
        <p className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {total} {itemName}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={!hasPrev || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Page Numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((pageNum, index) => (
              <React.Fragment key={index}>
                {pageNum === '...' ? (
                  <span className="px-2 py-1 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => handlePageClick(pageNum as number)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 text-sm rounded ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile Page Info */}
          <div className="sm:hidden px-3 py-1.5 text-sm text-gray-600">
            {page} of {totalPages}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!hasNext || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};