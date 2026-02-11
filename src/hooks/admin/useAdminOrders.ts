import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import { useOrderUIStore } from "@/stores/admin/orderStore";
import { adminOrdersService } from "@/services/admin/adminOrdersService";

export const useAdminOrders = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  const currentPage = useOrderUIStore(s => s.currentPage);

  return useQuery({
    queryKey: ["admin-orders", period, currentPage],
    queryFn: () => adminOrdersService.getOrders({ 
      period, 
      page: currentPage, 
      limit: 10 
    }),
    enabled: !!admin && !authLoading,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminOrderStats = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);

  return useQuery({
    queryKey: ["admin-order-stats", period],
    queryFn: () => adminOrdersService.getOrderStats(period),
    enabled: !!admin && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useExportAdminOrders = () => {
  return useMutation({
    mutationFn: (options: any) => adminOrdersService.exportOrders(options),
    onSuccess: () => {
      toast.success("Orders exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};