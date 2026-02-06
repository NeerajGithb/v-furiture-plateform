import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface ReviewsFiltersProps {
  statusFilter: string;
  ratingFilter: string;
  onStatusChange: (status: string) => void;
  onRatingChange: (rating: string) => void;
  onClearFilters?: () => void;
}

export function ReviewsFilters({
  statusFilter,
  ratingFilter,
  onStatusChange,
  onRatingChange,
  onClearFilters
}: ReviewsFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = statusFilter !== 'all' || ratingFilter !== 'all';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {statusFilter !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Status: {statusFilter}
                </span>
              )}
              {ratingFilter !== 'all' && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Rating: {ratingFilter} stars
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              showFilters ? 'bg-gray-100 text-gray-900' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => onRatingChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="flex items-end">
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}