import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import { useSellerOrderUIStore } from "@/stores/seller/orderStore";
import { sellerOrdersService } from "@/services/seller/sellerOrdersService";
import { 
  OrderStatusUpdate,
  OrderTrackingUpdate,
  OrderNotes,
  OrderCancel,
  BulkOrderUpdate,
  ExportOrdersOptions
} from "@/types/seller/orders";

export const useSellerOrders = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  const currentPage = useSellerOrderUIStore(s => s.currentPage);

  return useQuery({
    queryKey: ["seller-orders", period, currentPage],
    queryFn: () => sellerOrdersService.getOrders({ 
      period,
      page: currentPage, 
      limit: 20 
    }),
    enabled: !!seller && !authLoading,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerOrderStats = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);

  return useQuery({
    queryKey: ["seller-order-stats", period],
    queryFn: () => sellerOrdersService.getOrderStats(period),
    enabled: !!seller && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerOrder = (orderId: string) => {
  const { seller, isLoading: authLoading } = useAuthGuard();

  return useQuery({
    queryKey: ["seller-order", orderId],
    queryFn: () => sellerOrdersService.getOrderById(orderId),
    enabled: !!seller && !authLoading && !!orderId,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: OrderStatusUpdate }) =>
      sellerOrdersService.updateOrderStatus(orderId, data),
    onSuccess: (result, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["seller-order-stats"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateOrderTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: OrderTrackingUpdate }) =>
      sellerOrdersService.updateOrderTracking(orderId, data),
    onSuccess: (result, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order", orderId] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useAddOrderNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: OrderNotes }) =>
      sellerOrdersService.addOrderNotes(orderId, data),
    onSuccess: (result, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order", orderId] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: OrderCancel }) =>
      sellerOrdersService.cancelOrder(orderId, data),
    onSuccess: (result, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["seller-order-stats"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkUpdateOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkOrderUpdate) => sellerOrdersService.bulkUpdateOrders(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order-stats"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useExportOrders = () => {
  return useMutation({
    mutationFn: (options: ExportOrdersOptions) => sellerOrdersService.exportOrders(options),
    onSuccess: (result) => {
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = `orders-export-${new Date().toISOString().split('T')[0]}.xlsx`;
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