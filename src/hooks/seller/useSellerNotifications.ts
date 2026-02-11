import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useNotificationsUIStore } from "@/stores/seller/notificationsUIStore";
import { sellerNotificationsService } from "@/services/seller/sellerNotificationsService";
import { 
  BulkNotificationAction
} from "@/types/seller/notifications";

export const useSellerNotifications = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const currentPage = useNotificationsUIStore(s => s.currentPage);

  return useQuery({
    queryKey: ["seller-notifications", currentPage],
    queryFn: () => sellerNotificationsService.getNotifications({ page: currentPage }),
    enabled: !!seller && !authLoading,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerNotificationUnreadCount = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();

  return useQuery({
    queryKey: ["seller-notification-unread-count"],
    queryFn: () => sellerNotificationsService.getUnreadCount(),
    enabled: !!seller && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes instead of 1 minute
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => sellerNotificationsService.markAsRead(notificationId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["seller-notification-unread-count"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => sellerNotificationsService.deleteNotification(notificationId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["seller-notification-unread-count"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkDeleteNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { notificationIds: string[] }) => sellerNotificationsService.bulkDeleteNotifications(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["seller-notification-unread-count"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const usePerformBulkNotificationAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, data }: { action: string; data: BulkNotificationAction }) =>
      sellerNotificationsService.performBulkAction(action, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["seller-notification-unread-count"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sellerNotificationsService.clearAllNotifications(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["seller-notification-unread-count"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};