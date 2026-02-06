import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { sellerInventoryService } from "@/services/seller/sellerInventoryService";
import { 
  InventoryQuery,
  UpdateInventoryRequest,
  BulkInventoryUpdate,
  StockUpdateData,
  BulkStockUpdateData
} from "@/types/sellerInventory";

// Get inventory with filters and pagination
export const useSellerInventory = (params: InventoryQuery = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-inventory", params],
    queryFn: () => sellerInventoryService.getInventory(params),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Get inventory statistics
export const useSellerInventoryStats = (period?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-inventory-stats", period],
    queryFn: () => sellerInventoryService.getInventoryStats(period),
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get single inventory item
export const useSellerInventoryItem = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-inventory-item", productId],
    queryFn: () => sellerInventoryService.getInventoryItem(productId),
    enabled: enabled && !!productId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Update stock for a single product
export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, stockData }: { productId: string; stockData: StockUpdateData }) =>
      sellerInventoryService.updateStock(productId, stockData),
    onSuccess: (result, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["seller-inventory-item", productId] });
      queryClient.invalidateQueries({ queryKey: ["seller-inventory-stats"] });
      queryClient.invalidateQueries({ queryKey: ["seller-stock-history", productId] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Set reorder level for a product
export const useSetReorderLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, reorderLevel }: { productId: string; reorderLevel: number }) =>
      sellerInventoryService.setReorderLevel(productId, reorderLevel),
    onSuccess: (result, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["seller-inventory-item", productId] });
      queryClient.invalidateQueries({ queryKey: ["seller-inventory-stats"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Bulk update stock for multiple products
export const useBulkUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkStockUpdateData) => sellerInventoryService.bulkUpdateStock(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["seller-inventory-stats"] });
      toast.success(`${result.message} (${result.updatedCount} items updated)`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Get stock history for a product
export const useStockHistory = (productId: string, params: { page?: number; limit?: number } = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-stock-history", productId, params],
    queryFn: () => sellerInventoryService.getStockHistory(productId, params),
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get low stock alerts
export const useLowStockAlerts = (params: { page?: number; limit?: number; status?: 'active' | 'resolved' | 'all' } = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-low-stock-alerts", params],
    queryFn: () => sellerInventoryService.getLowStockAlerts(params),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Resolve low stock alert
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

// Export inventory
export const useExportInventory = () => {
  return useMutation({
    mutationFn: (params: {
      status?: string;
      search?: string;
      format?: 'csv' | 'xlsx';
      includeHistory?: boolean;
    }) => sellerInventoryService.exportInventory(params),
    onSuccess: (result) => {
      // Create download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = `inventory-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Legacy hooks for backward compatibility
export const useSellerInventoryData = useSellerInventory;
export const useUpdateSellerStock = useUpdateStock;
export const useBulkUpdateSellerStock = useBulkUpdateStock;
export const useSetSellerReorderLevel = useSetReorderLevel;
export const useExportSellerInventory = useExportInventory;

// Update inventory item (legacy)
export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateInventoryRequest }) =>
      sellerInventoryService.updateInventoryItem(productId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["seller-inventory-item", productId] });
      queryClient.invalidateQueries({ queryKey: ["seller-inventory-stats"] });
      toast.success("Inventory updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Bulk update inventory (legacy)
export const useBulkUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkInventoryUpdate) => sellerInventoryService.bulkUpdateInventory(data),
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