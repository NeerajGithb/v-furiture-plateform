import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { sellerInventoryService } from "@/services/seller/sellerInventoryService";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import { useInventoryStore } from "@/stores/seller/inventoryStore";
import { StockUpdateData } from "@/types/seller/inventory";

export const useSellerInventory = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  const currentPage = useInventoryStore(s => s.currentPage);

  return useQuery({
    queryKey: ["seller-inventory", period, currentPage],
    queryFn: () => sellerInventoryService.getInventory({ period, page: currentPage, limit: 20 }),
    enabled: !!seller && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerInventoryStats = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);

  return useQuery({
    queryKey: ["seller-inventory-stats", period],
    queryFn: () => sellerInventoryService.getInventoryStats(period),
    enabled: !!seller && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, stockData }: { productId: string; stockData: StockUpdateData }) =>
      sellerInventoryService.updateStock(productId, stockData),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["seller-inventory-stats"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useSetReorderLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, reorderLevel }: { productId: string; reorderLevel: number }) =>
      sellerInventoryService.setReorderLevel(productId, reorderLevel),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["seller-inventory-stats"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useLowStockAlerts = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();

  return useQuery({
    queryKey: ["seller-low-stock-alerts", { status: 'active' }],
    queryFn: () => sellerInventoryService.getLowStockAlerts({ status: 'active' }),
    enabled: !!seller && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useResolveLowStockAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => sellerInventoryService.resolveLowStockAlert(alertId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-low-stock-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["seller-inventory-stats"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};