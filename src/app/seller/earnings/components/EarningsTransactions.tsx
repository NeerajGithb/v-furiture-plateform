'use client';

import { useState } from 'react';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Search,
  Download,
  Eye,
  Calendar,
  IndianRupee,
  User,
  CheckSquare,
  Square,
  MoreHorizontal
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { EarningsTransactionsProps } from '@/types/seller/earnings';

export default function EarningsTransactions({
  transactions,
  filters,
  onFiltersChange,
  getStatusBadge,
  pagination,
  onPageChange,
  onBulkAction,
  isBulkProcessing
}: EarningsTransactionsProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(t => t._id));
    }
  };

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleBulkExport = () => {
    if (onBulkAction && selectedTransactions.length > 0) {
      onBulkAction(selectedTransactions, 'export');
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 20,
      status: 'all'
    });
  };

  const totalAmount = transactions.reduce((sum, t) => sum + (t.sellerAmount || t.amount), 0);
  const totalFees = transactions.reduce((sum, t) => sum + t.platformFee, 0);

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <p className="text-sm text-gray-500 mt-1">
            {pagination?.total || transactions.length} transactions • {formatCurrency(totalAmount)} earned
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedTransactions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md font-medium">
                {selectedTransactions.length} selected
              </span>
              <button
                onClick={handleBulkExport}
                disabled={isBulkProcessing}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                {isBulkProcessing ? 'Exporting...' : 'Export Selected'}
              </button>
            </div>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Enhanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => onFiltersChange({ ...filters, search: e.target.value, page: 1 })}
                  placeholder="Order number, customer..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as any, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="createdAt">Date</option>
                <option value="amount">Amount</option>
                <option value="orderNumber">Order Number</option>
                <option value="customerName">Customer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => onFiltersChange({ ...filters, sortOrder: e.target.value as any, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {transactions.length} of {pagination?.total || 0} transactions
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Package className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Platform Fees</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalFees)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Amount</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalAmount - totalFees)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {transactions.length > 0 ? (
          <>
            {/* Table Header */}
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  {selectedTransactions.length === transactions.length ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {selectedTransactions.length > 0 ? `${selectedTransactions.length} selected` : 'Select all'}
                </span>
              </div>
            </div>

            {/* Transactions List */}
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="group">
                  <div
                    className={`px-6 py-4 cursor-pointer transition-colors ${
                      expandedTransaction === transaction._id ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setExpandedTransaction(
                      expandedTransaction === transaction._id ? null : transaction._id
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTransaction(transaction._id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {selectedTransactions.includes(transaction._id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Package className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">#{transaction.orderNumber}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{transaction.customerName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">
                                {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {transaction.paymentMethod && (
                                <p className="text-xs text-gray-400 capitalize mt-1">
                                  {transaction.paymentMethod.replace('_', ' ')}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                {formatCurrency(transaction.sellerAmount || transaction.amount)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Fee: {formatCurrency(transaction.platformFee)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ring-1 ring-inset ${getStatusBadge(transaction.status)}`}>
                            {transaction.status}
                          </span>
                          <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                            {expandedTransaction === transaction._id ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTransaction === transaction._id && (
                    <div className="px-6 pb-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Transaction Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Order ID:</span>
                              <span className="font-medium text-gray-900">{transaction.orderId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Total Amount:</span>
                              <span className="font-medium text-gray-900">{formatCurrency(transaction.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Platform Fee:</span>
                              <span className="font-medium text-gray-900">{formatCurrency(transaction.platformFee)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Your Earnings:</span>
                              <span className="font-bold text-emerald-600">{formatCurrency(transaction.sellerAmount || transaction.amount)}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Name:</span>
                              <span className="font-medium text-gray-900">{transaction.customerName}</span>
                            </div>
                            {transaction.customerEmail && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Email:</span>
                                <span className="font-medium text-gray-900">{transaction.customerEmail}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-500">Order Status:</span>
                              <span className="font-medium text-gray-900 capitalize">{transaction.orderStatus}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => window.open(`/seller/orders/${transaction.orderId}`, '_blank')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-3 h-3" />
                          View Order
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
                          <Download className="w-3 h-3" />
                          Download Receipt
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No transactions found</p>
            <p className="text-gray-400 text-sm mt-1">Transactions will appear here once you start receiving orders</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}