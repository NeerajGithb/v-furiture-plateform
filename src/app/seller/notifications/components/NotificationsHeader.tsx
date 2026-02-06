import { Check, Trash2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface NotificationsHeaderProps {
  stats?: {
    unread?: number;
    total?: number;
  };
  selectedNotifications: string[];
  onRefresh: () => void;
  onMarkAllAsRead: () => void;
  onBulkDelete: () => void;
  onClearAll: () => void;
  refreshing: boolean;
  isMarkingAllAsRead: boolean;
  isBulkDeleting: boolean;
  isClearingAll: boolean;
}

export function NotificationsHeader({
  stats,
  selectedNotifications,
  onRefresh,
  onMarkAllAsRead,
  onBulkDelete,
  onClearAll,
  refreshing,
  isMarkingAllAsRead,
  isBulkDeleting,
  isClearingAll
}: NotificationsHeaderProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    setShowClearConfirm(false);
    onClearAll();
  };

  const unreadCount = stats?.unread || 0;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated with your business activities</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <div className="px-3 py-1 bg-rose-50 text-rose-700 text-sm font-medium rounded-full ring-1 ring-inset ring-rose-600/20 mr-2">
              {unreadCount} unread
            </div>
          )}
          
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {selectedNotifications.length > 0 && (
            <button
              onClick={onBulkDelete}
              disabled={isBulkDeleting}
              className="flex items-center gap-2 px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              {isBulkDeleting ? 'Deleting...' : `Delete (${selectedNotifications.length})`}
            </button>
          )}
          
          <button
            onClick={onMarkAllAsRead}
            disabled={isMarkingAllAsRead || !unreadCount}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
          >
            <Check className="w-4 h-4" />
            {isMarkingAllAsRead ? 'Marking...' : 'Mark All Read'}
          </button>
          
          <button
            onClick={handleClearAll}
            disabled={isClearingAll}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
          >
            <Trash2 className="w-4 h-4" />
            {isClearingAll ? 'Clearing...' : 'Clear All'}
          </button>
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear All Notifications</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to clear all notifications? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                disabled={isClearingAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isClearingAll ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}