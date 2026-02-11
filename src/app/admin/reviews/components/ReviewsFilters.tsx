'use client';

import React from 'react';
import { Search, X, Filter, Star, SortAsc, SortDesc } from 'lucide-react';

interface ReviewsFiltersProps {
    filters: {
        search?: string;
        status?: string;
        rating?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    };
    onFiltersChange: (filters: ReviewsFiltersProps['filters']) => void;
    onClear: () => void;
}

const REVIEW_STATUSES = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

const RATING_OPTIONS = [
    { value: '', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
];

const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'rating', label: 'Rating' },
    { value: 'helpfulVotes', label: 'Helpful Votes' },
];

export default function ReviewsFilters({ filters, onFiltersChange, onClear }: ReviewsFiltersProps) {
    const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

    const handleChange = (key: string, value: any) => {
        onFiltersChange({ ...filters, [key]: value || undefined });
    };

    const toggleSortOrder = () => {
        onFiltersChange({
            ...filters,
            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
        });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                    {hasActiveFilters && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Active
                        </span>
                    )}
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={onClear}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Search Reviews
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={filters.search || ''}
                            onChange={(e) => handleChange('search', e.target.value)}
                            placeholder="Search by comment or title..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Status
                    </label>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                        {REVIEW_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <Star className="inline w-3.5 h-3.5 mr-1" />
                        Rating
                    </label>
                    <select
                        value={filters.rating || ''}
                        onChange={(e) => handleChange('rating', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                        {RATING_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort By & Order */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Sort By
                        </label>
                        <select
                            value={filters.sortBy || 'createdAt'}
                            onChange={(e) => handleChange('sortBy', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Order
                        </label>
                        <button
                            onClick={toggleSortOrder}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        >
                            {filters.sortOrder === 'asc' ? (
                                <SortAsc className="w-5 h-5 text-gray-700" />
                            ) : (
                                <SortDesc className="w-5 h-5 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
