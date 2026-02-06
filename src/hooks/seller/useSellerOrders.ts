import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { sellerOrdersService } from "@/services/seller/sellerOrdersService";
import { 
  OrdersQuery,
  OrderStatusUpdate,
  OrderTrackingUpdate,
  OrderNotes,
  OrderCancel,
  BulkOrderUpdate,
  ExportOrdersOptions
} from "@/types/sellerOrder";

export const useSellerOrders = (params: OrdersQuery = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-orders", params],
    queryFn: () => sellerOrdersService.getOrders(params),
    enabled: enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerOrderStats = (period?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-order-stats", period],
    queryFn: () => sellerOrdersService.getOrderStats(period),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerOrder = (orderId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-order", orderId],
    queryFn: () => sellerOrdersService.getOrderById(orderId),
    enabled: enabled && !!orderId,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: OrderStatusUpdate }) =>
      sellerOrdersService.updateOrderStatus(orderId, data),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["seller-order-stats"] });
      toast.success("Order status updated successfully");
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
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order", orderId] });
      toast.success("Tracking information updated successfully");
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
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order", orderId] });
      toast.success("Notes added successfully");
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
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["seller-order-stats"] });
      toast.success("Order cancelled successfully");
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
    onSuccess: () => {
      toast.success("Orders exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};