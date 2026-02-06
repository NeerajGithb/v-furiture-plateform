import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminOrdersService } from "@/services/admin/adminOrdersService";
import { 
  AdminOrdersQuery,
  AdminOrderUpdate,
  AdminOrderBulkUpdate,
  AdminOrderBulkUpdateResponse
} from "@/types/order";

export const useAdminOrders = (params: AdminOrdersQuery = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => adminOrdersService.getOrders(params),
    enabled: enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminOrderStats = (period?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-order-stats", period],
    queryFn: () => adminOrdersService.getOrderStats(period),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminOrder = (orderId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => adminOrdersService.getOrderById(orderId),
    enabled: enabled && !!orderId,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useUpdateAdminOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: AdminOrderUpdate }) =>
      adminOrdersService.updateOrder(orderId, data),
    onSuccess: (updatedOrder, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.setQueryData(["admin-order", orderId], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] });
      toast.success("Order updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteAdminOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => adminOrdersService.deleteOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.removeQueries({ queryKey: ["admin-order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] });
      toast.success("Order deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkUpdateAdminOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminOrderBulkUpdate) => adminOrdersService.bulkUpdateOrders(data),
    onSuccess: (result: AdminOrderBulkUpdateResponse) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
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