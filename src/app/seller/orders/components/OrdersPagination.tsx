'use client';

import { useGlobalFilterStore } from '@/stores/globalFilterStore';
import { OrdersPaginationProps } from '@/types/sellerOrder';

export default function OrdersPagination({ pagination }: OrdersPaginationProps) {
  const { page, setPage } = useGlobalFilterStore();

  if (!pagination || pagination.pages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>
      <span className="px-4 py-2 text-sm text-gray-600">
        Page {page} of {pagination.pages}
      </span>
      <button
        onClick={() => setPage(page + 1)}
        disabled={page === pagination.pages}
        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
}