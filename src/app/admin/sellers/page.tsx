'use client';

import { useAdminSellers, useAdminSellerStats, useUpdateSellerStatus, useUpdateSellerVerification } from "@/hooks/admin/useAdminSellers";
import { useSellersUIStore } from "@/stores/admin/sellersStore";
import { LoaderGuard } from "@/components/ui/LoaderGuard";
import { Pagination } from "@/components/ui/Pagination";
import PageHeader from "@/components/PageHeader";
import type { SellerStatus } from "@/types/admin/sellers";
import SellersStats from "./components/SellersStats";
import SellersList from "./components/SellersList";

export default function AdminSellersPage() {
  const currentPage = useSellersUIStore(s => s.currentPage);
  const setCurrentPage = useSellersUIStore(s => s.setCurrentPage);

  const { data: sellersData, isPending, error, refetch, isFetching } = useAdminSellers();
  const { data: stats } = useAdminSellerStats();
  const updateSellerStatus = useUpdateSellerStatus();
  const updateSellerVerification = useUpdateSellerVerification();

  const handleStatusChange = (sellerId: string, newStatus: SellerStatus, reason?: string) => {
    updateSellerStatus.mutate({ sellerId, status: newStatus, reason });
  };

  const handleVerificationChange = (sellerId: string, verified: boolean) => {
    updateSellerVerification.mutate({ sellerId, verified });
  };

  return (
    <>
      <PageHeader
        title="Sellers"
        description="Manage seller accounts and approvals"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <LoaderGuard 
        isLoading={isPending} 
        error={error} 
        isEmpty={!sellersData || (sellersData.pagination?.total || 0) === 0}
        emptyMessage="No sellers"
      >
        {() => (
          <>
            {stats && (
              <SellersStats stats={stats} />
            )}

            <SellersList 
              sellers={sellersData!.data}
              onStatusChange={handleStatusChange}
              onVerificationChange={handleVerificationChange}
              isUpdating={updateSellerStatus.isPending || updateSellerVerification.isPending}
            />

            <Pagination 
              pagination={sellersData!.pagination}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </LoaderGuard>
    </>
  );
}