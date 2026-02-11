'use client';

import {
  useSellerNotifications,
  useMarkNotificationAsRead,
  useDeleteNotification,
  useBulkDeleteNotifications,
  usePerformBulkNotificationAction,
  useClearAllNotifications
} from '@/hooks/seller/useSellerNotifications';
import { useNotificationsUIStore } from '@/stores/seller/notificationsUIStore';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import PageHeader from '@/components/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Trash2, CheckCheck } from 'lucide-react';
import { NotificationsList } from './components/NotificationsList';
import { NotificationsStats } from './components/NotificationsStats';

export default function SellerNotificationsPage() {
  const currentPage = useNotificationsUIStore(s => s.currentPage);
  const setCurrentPage = useNotificationsUIStore(s => s.setCurrentPage);
  const selectedNotifications = useNotificationsUIStore(s => s.selectedNotifications);
  const toggleSelection = useNotificationsUIStore(s => s.toggleSelection);
  const selectAll = useNotificationsUIStore(s => s.selectAll);
  const clearSelection = useNotificationsUIStore(s => s.clearSelection);

  const { data, isPending, error, refetch, isFetching } = useSellerNotifications();

  const notifications = data?.notifications || [];
  const pagination = data?.pagination;

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

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    await bulkDelete.mutateAsync({ notificationIds: selectedNotifications });
    clearSelection();
  };

  const handleMarkAllAsRead = async () => {
    await performBulkAction.mutateAsync({
      action: 'mark_all_read',
      data: { notificationIds: [], action: 'mark_read' }
    });
  };

  const handleClearAll = async () => {
    await clearAll.mutateAsync();
    clearSelection();
  };

  const handleSelectAll = () => {
    selectAll(notifications.map(n => n.id));
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Manage your notifications and alerts"
        onRefresh={refetch}
        isRefreshing={isFetching}
        actions={
          <div className="flex items-center gap-2">
            {selectedNotifications.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDelete.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedNotifications.length})
              </button>
            )}
            <button
              onClick={handleMarkAllAsRead}
              disabled={performBulkAction.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          </div>
        }
      />

      <LoaderGuard 
        isLoading={isPending} 
        error={error}
        isEmpty={!data || (data.pagination?.total || 0) === 0}
        emptyMessage="No notifications"
      >
        {() => (
          <div className="space-y-6 max-w-7xl mx-auto">
            <NotificationsStats stats={stats} />

            <NotificationsList
              notifications={notifications}
              selectedNotifications={selectedNotifications}
              onToggleSelection={toggleSelection}
              onSelectAll={handleSelectAll}
              onClearSelection={clearSelection}
              onMarkAsRead={(id: string) => markAsRead.mutate(id)}
              onDelete={(id: string) => deleteNotification.mutate(id)}
              isMarkingAsRead={markAsRead.isPending}
              isDeleting={deleteNotification.isPending}
            />

            {pagination && (
              <Pagination 
                pagination={pagination} 
                onPageChange={setCurrentPage} 
              />
            )}
          </div>
        )}
      </LoaderGuard>
    </>
  );
}