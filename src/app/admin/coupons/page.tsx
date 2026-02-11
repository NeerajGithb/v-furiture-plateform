'use client';

import { Plus, Download } from 'lucide-react';
import {
  useAdminCoupons,
  useAdminCouponStats,
  useExportCoupons
} from '@/hooks/admin/useAdminCoupons';
import { useCouponUIStore } from '@/stores/admin/couponStore';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { Pagination } from '@/components/ui/Pagination';
import PageHeader from '@/components/PageHeader';
import CouponsOverview from './components/CouponsOverview';
import CouponsTable from './components/CouponsTable';
import CouponFormModal from './components/CouponFormModal';

export default function AdminCouponsPage() {
  const currentPage = useCouponUIStore(s => s.currentPage);
  const setCurrentPage = useCouponUIStore(s => s.setCurrentPage);
  const setShowCreateModal = useCouponUIStore(s => s.setShowCreateModal);

  const { data: couponsData, isPending, error, refetch, isFetching } = useAdminCoupons();
  const { data: stats, isPending: statsPending } = useAdminCouponStats();
  const exportMutation = useExportCoupons();

  const handleExport = () => {
    exportMutation.mutate({});
  };

  const handleCreateCoupon = () => {
    setShowCreateModal(true);
  };

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Create and manage discount coupons"
        onRefresh={refetch}
        isRefreshing={isFetching}
        actions={
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium text-gray-700"
            >
              <Download className="w-4 h-4" />
              {exportMutation.isPending ? 'Exporting...' : 'Export'}
            </button>
            <button
              onClick={handleCreateCoupon}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Coupon
            </button>
          </div>
        }
      />

      <LoaderGuard 
        isLoading={isPending} 
        error={error} 
        isEmpty={!couponsData || (couponsData.pagination?.total || 0) === 0}
        emptyMessage="No coupons"
      >
        {() => (
          <>
            <CouponsOverview stats={stats} isLoading={statsPending} />

            <CouponsTable coupons={couponsData!.data} />

            <Pagination 
              pagination={couponsData!.pagination}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </LoaderGuard>

      <CouponFormModal />
    </>
  );
}
