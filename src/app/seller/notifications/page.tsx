'use client';

import { useState } from 'react';
import { useGlobalFilterStore } from '@/stores/globalFilterStore';
import {
  useSellerNotifications,
  useMarkNotificationAsRead,
  useDeleteNotification,
  useBulkDeleteNotifications,
  usePerformBulkNotificationAction,
  useClearAllNotifications
} from '@/hooks/seller/useSellerNotifications';
import { NotificationsSkeleton } from './components/NotificationsSkeleton';
import { NotificationsHeader } from './components/NotificationsHeader';
import { NotificationsPagination } from './components/NotificationsPagination';
import { NotificationsList } from './components/NotificationsList';
import { NotificationsStats } from './components/NotificationsStats';

export default function SellerNotificationsPage() {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Global filters
  const { page, setPage } = useGlobalFilterStore();

  // React Query hooks
  const { data: notificationsData, isLoading, refetch } = useSellerNotifications({ page });

  // Use data directly from API
  const notifications = notificationsData?.notifications || [];
  const pagination = notificationsData?.pagination;

  // Create mock stats from notifications data
  const stats = notifications.length > 0 ? {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    dismissed: notifications.filter(n => n.dismissed).length,
    byType: {
      order: notifications.filter(n => n.type === 'order').length,
      account: notifications.filter(n => n.type === 'account').length,
      product: notifications.filter(n => n.type === 'product').length,
      payment: notifications.filter(n => n.type === 'payment').length,
      inventory: notifications.filter(n => n.type === 'inventory').length,
      performance: notifications.filter(n => n.type === 'performance').length,
      customer: notifications.filter(n => n.type === 'customer').length,
      system: notifications.filter(n => n.type === 'system').length,
    },
    byPriority: {
      low: notifications.filter(n => n.priority === 'low').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      high: notifications.filter(n => n.priority === 'high').length,
      critical: notifications.filter(n => n.priority === 'critical').length,
    },
    recentActivity: {
      today: notifications.filter(n => {
        const today = new Date();
        const notificationDate = new Date(n.createdAt);
        return notificationDate.toDateString() === today.toDateString();
      }).length,
      thisWeek: notifications.filter(n => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(n.createdAt) >= weekAgo;
      }).length,
      thisMonth: notifications.filter(n => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return new Date(n.createdAt) >= monthAgo;
      }).length,
    }
  } : undefined;

  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();
  const bulkDelete = useBulkDeleteNotifications();
  const performBulkAction = usePerformBulkNotificationAction();
  const clearAll = useClearAllNotifications();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;

    await bulkDelete.mutateAsync({ notificationIds: selectedNotifications });
    setSelectedNotifications([]);
  };

  const handleMarkAllAsRead = async () => {
    await performBulkAction.mutateAsync({
      action: 'mark_all_read',
      data: { notificationIds: [], action: 'mark_read' }
    });
  };

  const handleClearAll = async () => {
    await clearAll.mutateAsync();
    setSelectedNotifications([]);
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllNotifications = () => {
    setSelectedNotifications(notifications.map(n => n._id));
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      {isLoading && <NotificationsSkeleton />}
      {!isLoading && (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
          <NotificationsHeader
            stats={stats}
            selectedNotifications={selectedNotifications}
            onRefresh={handleRefresh}
            onMarkAllAsRead={handleMarkAllAsRead}
            onBulkDelete={handleBulkDelete}
            onClearAll={handleClearAll}
            refreshing={refreshing}
            isMarkingAllAsRead={performBulkAction.isPending}
            isBulkDeleting={bulkDelete.isPending}
            isClearingAll={clearAll.isPending}
          />

          <NotificationsStats stats={stats} />

          <NotificationsList
            notifications={notifications}
            selectedNotifications={selectedNotifications}
            onToggleSelection={toggleNotificationSelection}
            onSelectAll={selectAllNotifications}
            onClearSelection={clearSelection}
            onMarkAsRead={(id: string) => markAsRead.mutate(id)}
            onDelete={(id: string) => deleteNotification.mutate(id)}
            isMarkingAsRead={markAsRead.isPending}
            isDeleting={deleteNotification.isPending}
          />

          {pagination && pagination.totalPages > 1 && (
            <NotificationsPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </>
  );
}