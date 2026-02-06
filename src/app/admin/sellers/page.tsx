"use client"

import { useAdminSellers, useAdminSellerStats, useUpdateSellerStatus, useUpdateSellerVerification } from "@/hooks/admin/useAdminSellers";
import { useSellersUIStore } from "@/stores/admin/sellersStore";
import { LoaderGuard } from "@/components/ui/LoaderGuard";
import { Pagination } from "@/components/ui/Pagination";
import SellersStats from "./components/SellersStats";
import SellersFilters from "./components/SellersFilters";
import SellersList from "./components/SellersList";

export default function AdminSellersPage() {
  const currentPage = useSellersUIStore(s => s.currentPage);
  const setCurrentPage = useSellersUIStore(s => s.setCurrentPage);

  const { data: sellersData, isLoading, error } = useAdminSellers({
    page: currentPage,
    limit: 20,
  });

  const { data: stats, isLoading: isStatsLoading } = useAdminSellerStats();
  const updateSellerStatus = useUpdateSellerStatus();
  const updateSellerVerification = useUpdateSellerVerification();

  const handleStatusChange = (sellerId: string, newStatus: "active" | "pending" | "suspended" | "inactive") => {
    updateSellerStatus.mutate({ sellerId, data: { status: newStatus } });
  };

  const handleVerificationChange = (sellerId: string, verified: boolean) => {
    updateSellerVerification.mutate({ sellerId, data: { verified } });
  };

  return (
    <LoaderGuard isLoading={isLoading} error={error}>
      <SellersStats stats={stats} isLoading={isStatsLoading} />

      <SellersFilters />

      <SellersList 
        sellers={sellersData?.data || []}
        onStatusChange={handleStatusChange}
        onVerificationChange={handleVerificationChange}
        isUpdating={updateSellerStatus.isPending || updateSellerVerification.isPending}
      />

      {sellersData?.pagination && sellersData.pagination.totalPages > 1 && (
        <Pagination 
          pagination={sellersData.pagination}
          onPageChange={setCurrentPage}
        />
      )}
    </LoaderGuard>
  );
}
