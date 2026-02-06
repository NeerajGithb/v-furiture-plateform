'use client';

import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { OrdersFiltersProps } from '@/types/sellerOrder';

export default function OrdersFilters({
  filterStatus,
  setFilterStatus,
  showFilters,
  setShowFilters
}: OrdersFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <select
          value={filterStatus}
          onChange={(e) => {
            const value = e.target.value;
            setFilterStatus(value === 'all' ? undefined : value);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ml-auto text-sm font-medium border ${showFilters
            ? 'bg-gray-100 border-gray-200 text-gray-900'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setFilterStatus(undefined)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}