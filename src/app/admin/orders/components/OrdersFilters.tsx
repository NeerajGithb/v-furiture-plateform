'use client';

import React from 'react';
import { Search, X, Filter, Calendar, DollarSign, SortAsc, SortDesc } from 'lucide-react';

interface OrdersFiltersProps {
    filters: {
        search?: string;
        orderStatus?: string;
        paymentStatus?: string;
        startDate?: string;
        endDate?: string;
        minAmount?: number;
        maxAmount?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    };
    onFiltersChange: (filters: OrdersFiltersProps['filters']) => void;
    onClear: () => void;
}

const ORDER_STATUSES = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' },
];

const PAYMENT_STATUSES = [
    { value: '', label: 'All Payment Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
];

const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'totalAmount', label: 'Order Amount' },
    { value: 'orderNumber', label: 'Order Number' },
];

export default function OrdersFilters({ filters, onFiltersChange, onClear }: OrdersFiltersProps) {
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Search Orders
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={filters.search || ''}
                            onChange={(e) => handleChange('search', e.target.value)}
                            placeholder="Order number, customer name, phone..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                {/* Order Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Order Status
                    </label>
                    <select
                        value={filters.orderStatus || ''}
                        onChange={(e) => handleChange('orderStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                        {ORDER_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Payment Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Payment Status
                    </label>
                    <select
                        value={filters.paymentStatus || ''}
                        onChange={(e) => handleChange('paymentStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                        {PAYMENT_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Start Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <Calendar className="inline w-3.5 h-3.5 mr-1" />
                        From Date
                    </label>
                    <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => handleChange('startDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <Calendar className="inline w-3.5 h-3.5 mr-1" />
                        To Date
                    </label>
                    <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleChange('endDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>

                {/* Min Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <DollarSign className="inline w-3.5 h-3.5 mr-1" />
                        Min Amount
                    </label>
                    <input
                        type="number"
                        value={filters.minAmount || ''}
                        onChange={(e) => handleChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>

                {/* Max Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <DollarSign className="inline w-3.5 h-3.5 mr-1" />
                        Max Amount
                    </label>
                    <input
                        type="number"
                        value={filters.maxAmount || ''}
                        onChange={(e) => handleChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
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
