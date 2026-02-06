'use client';

import { useState } from 'react';
import {
  useSellerEarnings,
  useSellerEarningsSummary,
  useSellerTransactions,
  useSellerPayouts,
  useSellerEarningsAnalytics,
  useRequestPayout,
  useCancelPayout,
  useExportEarnings,
  useBulkTransactionAction
} from '@/hooks/seller/useSellerEarnings';
import { EarningsFilters, PayoutFilters } from '@/types/sellerEarnings';
import EarningsSkeleton from '../components/skeletons/EarningsSkeleton';
import {
  EarningsHeader,
  EarningsSummary,
  EarningsOverview,
  EarningsTransactions,
  EarningsPayouts,
  EarningsAnalytics
} from './components';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function SellerEarningsPage() {
  const [period, setPeriod] = useState('30days');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payouts' | 'analytics'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters state
  const [transactionFilters, setTransactionFilters] = useState<EarningsFilters>({
    page: 1,
    limit: 20,
    status: 'all'
  });
  const [payoutFilters, setPayoutFilters] = useState<PayoutFilters>({
    page: 1,
    limit: 10,
    status: 'all'
  });

  // React Query hooks
  const { data: earningsData, isLoading, error, refetch } = useSellerEarnings({ period });
  const { data: summary } = useSellerEarningsSummary(period);
  const { data: transactionsData } = useSellerTransactions(transactionFilters);
  const { data: payoutsData } = useSellerPayouts(payoutFilters);
  const { data: analytics } = useSellerEarningsAnalytics(period);
  
  // Mutations
  const requestPayout = useRequestPayout();
  const cancelPayout = useCancelPayout();
  const exportEarnings = useExportEarnings();
  const bulkTransactionAction = useBulkTransactionAction();

  const handleRequestPayout = async (amount: number, method: 'bank_transfer' | 'upi' | 'wallet', accountDetails?: any) => {
    await requestPayout.mutateAsync({
      amount,
      method,
      accountDetails
    });
  };

  const handleCancelPayout = async (payoutId: string) => {
    await cancelPayout.mutateAsync(payoutId);
  };

  const handleExport = async (options = {}) => {
    await exportEarnings.mutateAsync({
      period,
      includeTransactions: true,
      includePayouts: true,
      includeSummary: true,
      format: 'xlsx',
      ...options
    });
  };

  const handleBulkTransactionAction = async (transactionIds: string[], action: 'export' | 'mark_reviewed') => {
    await bulkTransactionAction.mutateAsync({
      transactionIds,
      action
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20';
      case 'pending':
        return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20';
      case 'processing':
        return 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20';
      case 'failed':
        return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20';
      case 'cancelled':
        return 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Earnings</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Unable to load earnings data. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Retrying...' : 'Retry'}
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && <EarningsSkeleton />}
      {!isLoading && (
        <div className="space-y-6 max-w-7xl mx-auto">
          <EarningsHeader
            period={period}
            onPeriodChange={setPeriod}
            onExport={handleExport}
            isExporting={exportEarnings.isPending}
          />

          <EarningsSummary summary={summary || earningsData?.summary} />

          {/* Enhanced Tabs */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', count: null },
                  { id: 'transactions', label: 'Transactions', count: transactionsData?.pagination?.total },
                  { id: 'payouts', label: 'Payouts', count: payoutsData?.pagination?.total },
                  { id: 'analytics', label: 'Analytics', count: null }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === tab.id
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== null && tab.count !== undefined && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600'
                        }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <EarningsOverview
                  summary={summary || earningsData?.summary}
                  transactions={transactionsData?.transactions || earningsData?.transactions || []}
                  onRequestPayout={handleRequestPayout}
                  isRequestingPayout={requestPayout.isPending}
                  getStatusBadge={getStatusBadge}
                />
              )}

              {activeTab === 'transactions' && (
                <EarningsTransactions
                  transactions={transactionsData?.transactions || []}
                  filters={transactionFilters}
                  onFiltersChange={setTransactionFilters}
                  getStatusBadge={getStatusBadge}
                  pagination={transactionsData?.pagination}
                  onPageChange={(page) => setTransactionFilters(prev => ({ ...prev, page }))}
                  onBulkAction={handleBulkTransactionAction}
                  isBulkProcessing={bulkTransactionAction.isPending}
                />
              )}

              {activeTab === 'payouts' && (
                <EarningsPayouts
                  payouts={payoutsData?.payouts || []}
                  getStatusBadge={getStatusBadge}
                  pagination={payoutsData?.pagination}
                  onPageChange={(page) => setPayoutFilters(prev => ({ ...prev, page }))}
                  onCancelPayout={handleCancelPayout}
                  isCancelling={cancelPayout.isPending}
                />
              )}

              {activeTab === 'analytics' && (
                <EarningsAnalytics
                  analytics={analytics}
                  period={period}
                  onPeriodChange={setPeriod}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
