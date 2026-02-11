'use client';

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
import { useEarningsUIStore } from '@/stores/seller/earningsUIStore';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import PageHeader from '@/components/PageHeader';
import { Download } from 'lucide-react';
import {
  EarningsSummary,
  EarningsOverview,
  EarningsTransactions,
  EarningsPayouts,
  EarningsAnalytics
} from './components';

export default function SellerEarningsPage() {
  const activeTab = useEarningsUIStore(s => s.activeTab);
  const setActiveTab = useEarningsUIStore(s => s.setActiveTab);
  const transactionsPage = useEarningsUIStore(s => s.transactionsPage);
  const setTransactionsPage = useEarningsUIStore(s => s.setTransactionsPage);
  const payoutsPage = useEarningsUIStore(s => s.payoutsPage);
  const setPayoutsPage = useEarningsUIStore(s => s.setPayoutsPage);

  const { data: earningsData, isPending, error } = useSellerEarnings();
  const { data: summary } = useSellerEarningsSummary();
  const { data: transactionsData } = useSellerTransactions();
  const { data: payoutsData } = useSellerPayouts();
  const { data: analytics } = useSellerEarningsAnalytics();
  
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

  return (
    <LoaderGuard 
      isLoading={isPending} 
      error={error}
      isEmpty={!earningsData}
      emptyMessage="No earnings data"
    >
      {() => (
        <div className="space-y-6 max-w-7xl mx-auto">
          <PageHeader
            title="Earnings"
            description="Track your revenue and payouts"
            actions={
              <button
                onClick={handleExport}
                disabled={exportEarnings.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                {exportEarnings.isPending ? 'Exporting...' : 'Export'}
              </button>
            }
          />

          <EarningsSummary summary={summary || earningsData?.summary} />

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
                  filters={{ page: transactionsPage, limit: 20, status: 'all' }}
                  onFiltersChange={(filters) => setTransactionsPage(filters.page || 1)}
                  getStatusBadge={getStatusBadge}
                  pagination={transactionsData?.pagination}
                  onPageChange={setTransactionsPage}
                  onBulkAction={handleBulkTransactionAction}
                  isBulkProcessing={bulkTransactionAction.isPending}
                />
              )}

              {activeTab === 'payouts' && (
                <EarningsPayouts
                  payouts={payoutsData?.payouts || []}
                  getStatusBadge={getStatusBadge}
                  pagination={payoutsData?.pagination}
                  onPageChange={setPayoutsPage}
                  onCancelPayout={handleCancelPayout}
                  isCancelling={cancelPayout.isPending}
                />
              )}

              {activeTab === 'analytics' && (
                <EarningsAnalytics
                  analytics={analytics}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </LoaderGuard>
  );
}
