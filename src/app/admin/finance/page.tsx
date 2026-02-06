'use client';

import { IndianRupee, Download, RefreshCw } from 'lucide-react';
import { useAdminFinance, useExportAdminFinanceData } from '@/hooks/admin/useAdminFinance';
import { useFinanceUIStore } from '@/stores/admin/financeStore';
import { useGlobalFilterStore } from '@/stores/admin/globalFilterStore';
import { TimePeriod } from '@/types/common';
import FinanceSkeleton from './components/FinanceSkeleton';
import FinanceStats from './components/FinanceStats';
import TransactionStats from './components/TransactionStats';
import TransactionsTable from './components/TransactionsTable';

export default function AdminFinancePage() {
  const { data: financeData, isLoading, refetch } = useAdminFinance();
  const { mutate: exportReport, isPending: exportPending } = useExportAdminFinanceData();
  const { setSelectedPeriod } = useFinanceUIStore();
  const { period, setPeriod } = useGlobalFilterStore();

  const handlePeriodChange = (newPeriod: string) => {
    const typedPeriod = newPeriod as TimePeriod;
    setPeriod(typedPeriod);
    setSelectedPeriod(typedPeriod);
  };

  const handleExport = () => {
    exportReport({ period });
  };

  return (
    <>
      {isLoading && <FinanceSkeleton />}
      {!isLoading && financeData && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <IndianRupee className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
                <p className="text-sm text-gray-500">Financial overview and transaction management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={period}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                disabled={exportPending}
                className="flex items-center gap-2 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                {exportPending ? 'Exporting...' : 'Export Report'}
              </button>
            </div>
          </div>

          {/* Financial Summary (Money) */}
          <FinanceStats summary={financeData.summary} />

          {/* Stats Summary (Orders) */}
          <TransactionStats stats={financeData.stats} />

          {/* Recent Transactions */}
          <TransactionsTable transactions={financeData.transactions} />
        </div>
      )}
    </>
  );
}
