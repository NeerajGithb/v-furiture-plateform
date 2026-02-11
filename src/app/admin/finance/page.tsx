'use client';

import { Download, DollarSign, ShoppingCart } from 'lucide-react';
import { useAdminFinance, useExportAdminFinanceData } from '@/hooks/admin/useAdminFinance';
import { useGlobalFilterStore } from '@/stores/globalFilterStore';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { EmptyStateGuard } from '@/components/ui/EmptyStateGuard';
import { EmptyState } from '@/components/ui/EmptyState';
import PageHeader from '@/components/PageHeader';
import FinanceStats from './components/FinanceStats';
import TransactionStats from './components/TransactionStats';
import TransactionsTable from './components/TransactionsTable';

export default function AdminFinancePage() {
  const { data: financeData, isPending, error, refetch, isFetching } = useAdminFinance();
  const { mutate: exportReport, isPending: exportPending } = useExportAdminFinanceData();
  const period = useGlobalFilterStore(s => s.period);

  const handleExport = () => {
    exportReport({ period });
  };

  return (
    <LoaderGuard isLoading={isPending} error={error} isEmpty={!financeData}>
      {() => {
        const sections = [
          {
            total: financeData!.summary.totalRevenue,
            title: 'Revenue',
            icon: DollarSign,
            node: <FinanceStats summary={financeData!.summary} />
          },
          {
            total: financeData!.stats.totalOrders,
            title: 'Transactions',
            icon: ShoppingCart,
            node: (
              <>
                <TransactionStats stats={financeData!.stats} />
                <TransactionsTable transactions={financeData!.transactions} />
              </>
            )
          }
        ];

        return (
          <>
            <PageHeader
              title="Finance"
              description="Financial overview and transaction management"
              onRefresh={refetch}
              isRefreshing={isFetching}
              actions={
                <button
                  onClick={handleExport}
                  disabled={exportPending}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  {exportPending ? 'Exporting...' : 'Export Report'}
                </button>
              }
            />

            {sections.map((section) => (
              <EmptyStateGuard
                key={section.title}
                total={section.total}
                empty={<EmptyState icon={section.icon} title={`No ${section.title.toLowerCase()}`} />}
              >
                {section.node}
              </EmptyStateGuard>
            ))}
          </>
        );
      }}
    </LoaderGuard>
  );
}
