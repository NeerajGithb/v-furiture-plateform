import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { sellerNotificationsService } from "@/services/seller/sellerNotificationsService";
import { 
  NotificationsQuery,
  BulkNotificationAction
} from "@/types/sellerNotifications";

export const useSellerNotifications = (params: NotificationsQuery = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-notifications", params],
    queryFn: () => sellerNotificationsService.getNotifications(params),
    enabled: enabled,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerNotificationUnreadCount = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-notification-unread-count"],
    queryFn: () => sellerNotificationsService.getUnreadCount(),
    enabled: enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useSellerNotification = (notificationId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-notification", notificationId],
    queryFn: () => sellerNotificationsService.getNotificationById(notificationId),
    enabled: enabled && !!notificationId,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => sellerNotificationsService.markAsRead(notificationId),
    onSuccess: (result, notificationId) => {
      queryClient.invalidateQueries({ queryKey: ["seller-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["seller-notification", notificationId] });
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
    onSuccess: (result, notificationId) => {
      queryClient.invalidateQueries({ queryKey: ["seller-notifications"] });
      queryClient.removeQueries({ queryKey: ["seller-notification", notificationId] });
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