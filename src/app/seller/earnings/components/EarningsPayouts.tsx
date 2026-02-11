'use client';

import { useState } from 'react';
import { CreditCard, X, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { EarningsPayoutsProps } from '@/types/seller/earnings';

export default function EarningsPayouts({
  payouts,
  getStatusBadge,
  pagination,
  onPageChange,
  onCancelPayout,
  isCancelling
}: EarningsPayoutsProps) {
  const [expandedPayout, setExpandedPayout] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelPayout = async (payoutId: string) => {
    if (!onCancelPayout) return;
    
    setCancellingId(payoutId);
    await onCancelPayout(payoutId);
    setCancellingId(null);
  };

  const getPayoutIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-gray-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const canCancelPayout = (status: string) => {
    return status === 'pending' || status === 'processing';
  };

  if (!payouts || payouts.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Payouts Yet</h3>
        <p className="text-gray-500">Your payout history will appear here once you request withdrawals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Payout History</h3>
        {pagination && (
          <p className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payouts
          </p>
        )}
      </div>

      <div className="space-y-3">
        {payouts.map((payout) => (
          <div key={payout._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    {getPayoutIcon(payout.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm">
                        Payout #{payout._id.slice(-6).toUpperCase()}
                      </p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset ${getStatusBadge(payout.status)}`}>
                        {payout.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 capitalize">
                      {payout.method.replace('_', ' ')} • {new Date(payout.createdAt).toLocaleDateString()}
                    </p>
                    {payout.processedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Processed: {new Date(payout.processedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">{formatCurrency(payout.amount)}</p>
                    {payout.transactionId && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        TXN: {payout.transactionId.slice(-8).toUpperCase()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {canCancelPayout(payout.status) && onCancelPayout && (
                      <button
                        onClick={() => handleCancelPayout(payout._id)}
                        disabled={cancellingId === payout._id || isCancelling}
                        className="px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingId === payout._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => setExpandedPayout(expandedPayout === payout._id ? null : payout._id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedPayout === payout._id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedPayout === payout._id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Method:</span>
                          <span className="text-gray-900 capitalize">{payout.method.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount:</span>
                          <span className="text-gray-900 font-medium">{formatCurrency(payout.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className={`capitalize font-medium ${
                            payout.status === 'paid' ? 'text-emerald-600' :
                            payout.status === 'processing' ? 'text-blue-600' :
                            payout.status === 'pending' ? 'text-amber-600' :
                            payout.status === 'failed' ? 'text-rose-600' :
                            'text-gray-600'
                          }`}>
                            {payout.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Timeline</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Requested:</span>
                          <span className="text-gray-900">{new Date(payout.requestedAt || payout.createdAt).toLocaleDateString()}</span>
                        </div>
                        {payout.processedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Processed:</span>
                            <span className="text-gray-900">{new Date(payout.processedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {payout.completedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Completed:</span>
                            <span className="text-gray-900">{new Date(payout.completedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  {payout.accountDetails && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Account Details</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {payout.accountDetails.accountNumber && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Account:</span>
                              <span className="text-gray-900 font-mono">****{payout.accountDetails.accountNumber.slice(-4)}</span>
                            </div>
                          )}
                          {payout.accountDetails.bankName && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Bank:</span>
                              <span className="text-gray-900">{payout.accountDetails.bankName}</span>
                            </div>
                          )}
                          {payout.accountDetails.upiId && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">UPI ID:</span>
                              <span className="text-gray-900 font-mono">{payout.accountDetails.upiId}</span>
                            </div>
                          )}
                          {payout.accountDetails.walletId && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Wallet:</span>
                              <span className="text-gray-900 font-mono">{payout.accountDetails.walletId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Failure Reason */}
                  {payout.failureReason && (
                    <div className="mt-4">
                      <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-rose-800">Payout Failed</p>
                          <p className="text-sm text-rose-700 mt-1">{payout.failureReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && onPageChange && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Total: {pagination.total} payouts
          </p>
        </div>
      )}
    </div>
  );
}