'use client';

import { useState } from 'react';
import { Package, CreditCard, X, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { EarningsOverviewProps, PayoutMethod } from '@/types/sellerEarnings';

interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, method: PayoutMethod, accountDetails?: any) => void;
  availableAmount: number;
  isSubmitting: boolean;
}

function PayoutRequestModal({ isOpen, onClose, onSubmit, availableAmount, isSubmitting }: PayoutRequestModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayoutMethod>('bank_transfer');
  const [accountDetails, setAccountDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: '',
    upiId: '',
    walletId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (numAmount <= 0 || numAmount > availableAmount) {
      return;
    }

    let details = {};
    if (method === 'bank_transfer') {
      details = {
        accountNumber: accountDetails.accountNumber,
        ifscCode: accountDetails.ifscCode,
        bankName: accountDetails.bankName,
        accountHolderName: accountDetails.accountHolderName
      };
    } else if (method === 'upi') {
      details = { upiId: accountDetails.upiId };
    } else if (method === 'wallet') {
      details = { walletId: accountDetails.walletId };
    }

    onSubmit(numAmount, method, details);
  };

  const resetForm = () => {
    setAmount('');
    setMethod('bank_transfer');
    setAccountDetails({
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: '',
      upiId: '',
      walletId: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Request Payout</h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Available for payout: <span className="font-semibold">{formatCurrency(availableAmount)}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payout Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={availableAmount}
              min="1"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payout Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PayoutMethod)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          {method === 'bank_transfer' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={accountDetails.accountHolderName}
                  onChange={(e) => setAccountDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountDetails.accountNumber}
                  onChange={(e) => setAccountDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={accountDetails.ifscCode}
                  onChange={(e) => setAccountDetails(prev => ({ ...prev, ifscCode: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={accountDetails.bankName}
                  onChange={(e) => setAccountDetails(prev => ({ ...prev, bankName: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {method === 'upi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID
              </label>
              <input
                type="text"
                value={accountDetails.upiId}
                onChange={(e) => setAccountDetails(prev => ({ ...prev, upiId: e.target.value }))}
                required
                placeholder="example@upi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {method === 'wallet' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet ID
              </label>
              <input
                type="text"
                value={accountDetails.walletId}
                onChange={(e) => setAccountDetails(prev => ({ ...prev, walletId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableAmount}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Request Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EarningsOverview({
  summary,
  transactions,
  onRequestPayout,
  isRequestingPayout,
  getStatusBadge
}: EarningsOverviewProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const handlePayoutRequest = (amount: number, method: PayoutMethod, accountDetails?: any) => {
    onRequestPayout(amount, method, accountDetails);
    setShowPayoutModal(false);
  };

  const availableAmount = summary?.completedRevenue || 0;
  const hasAvailableAmount = availableAmount > 0;

  return (
    <div className="space-y-6">
      {/* Payout Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-700" />
              Ready for Payout
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              You have <span className="font-semibold text-gray-900">{formatCurrency(availableAmount)}</span> available for withdrawal
            </p>
            {!hasAvailableAmount && (
              <div className="flex items-start gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Complete more orders to build up your available balance for payout.
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={isRequestingPayout || !hasAvailableAmount}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            {isRequestingPayout ? 'Processing...' : 'Request Payout'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-semibold text-gray-900">{formatCurrency(summary?.totalRevenue || 0)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Revenue</p>
              <p className="text-xl font-semibold text-gray-900">{formatCurrency(summary?.pendingRevenue || 0)}</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Platform Fees</p>
              <p className="text-xl font-semibold text-gray-900">{formatCurrency(summary?.platformFees || 0)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <p className="text-sm text-gray-500">Last 5 transactions</p>
        </div>
        
        {transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-gray-100 rounded-lg border border-gray-200">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{transaction.orderNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{transaction.customerName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">{formatCurrency(transaction.amount || transaction.sellerAmount)}</p>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset inline-block ${getStatusBadge(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      <PayoutRequestModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSubmit={handlePayoutRequest}
        availableAmount={availableAmount}
        isSubmitting={isRequestingPayout}
      />
    </div>
  );
}