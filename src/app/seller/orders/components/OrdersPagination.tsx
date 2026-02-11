'use client';

import { OrdersPaginationProps } from '@/types/seller/orders';

export default function OrdersPagination({ pagination, onPageChange }: OrdersPaginationProps & { onPageChange: (page: number) => void }) {
  if (!pagination || pagination.pages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>
      <span className="px-4 py-2 text-sm text-gray-600">
        Page {pagination.page} of {pagination.pages}
      </span>
      <button
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={pagination.page === pagination.pages}
        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
}