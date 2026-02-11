import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import { useSellersUIStore } from "@/stores/admin/sellersStore";
import { adminSellersService } from "@/services/admin/adminSellersService";
import type { SellerStatus } from "@/types/admin/sellers";

export const useAdminSellers = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  const currentPage = useSellersUIStore(s => s.currentPage);
  
  return useQuery({
    queryKey: ["admin-sellers", period, currentPage],
    queryFn: () => adminSellersService.getSellers({ period, page: currentPage, limit: 20 }),
    enabled: !!admin && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminSellerStats = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  
  return useQuery({
    queryKey: ["admin-seller-stats", period],
    queryFn: () => adminSellersService.getSellerStats(period),
    enabled: !!admin && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUpdateSellerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sellerId, status, reason }: { sellerId: string; status: SellerStatus; reason?: string }) =>
      adminSellersService.updateSellerStatus(sellerId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-seller-stats"] });
      toast.success("Seller status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateSellerVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sellerId, verified }: { sellerId: string; verified: boolean }) =>
      adminSellersService.updateSellerVerification(sellerId, verified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      toast.success("Seller verification updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};