import { useState } from 'react';
import { 
  Check, 
  Trash2, 
  Eye, 
  EyeOff,
  Clock,
  AlertCircle,
  Package,
  CreditCard,
  Users,
  Settings,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { SellerNotification } from '@/types/sellerNotifications';
import { TYPE_BADGE_CONFIG, PRIORITY_BADGE_CONFIG } from '@/types/sellerNotifications';

interface NotificationsListProps {
  notifications: SellerNotification[];
  selectedNotifications: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingAsRead: boolean;
  isDeleting: boolean;
}

export function NotificationsList({
  notifications,
  selectedNotifications,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onMarkAsRead,
  onDelete,
  isMarkingAsRead,
  isDeleting
}: NotificationsListProps) {
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);

  const typeIcons = {
    order: Package,
    account: Users,
    product: Package,
    payment: CreditCard,
    inventory: Package,
    performance: TrendingUp,
    customer: Users,
    system: Settings
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const toggleExpanded = (notificationId: string) => {
    setExpandedNotification(
      expandedNotification === notificationId ? null : notificationId
    );
  };

  const allSelected = notifications.length > 0 && selectedNotifications.length === notifications.length;
  const someSelected = selectedNotifications.length > 0 && selectedNotifications.length < notifications.length;

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">You have no notifications at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header with bulk actions */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={() => allSelected ? onClearSelection() : onSelectAll()}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {selectedNotifications.length > 0 
                  ? `${selectedNotifications.length} selected`
                  : 'Select all'
                }
              </span>
            </label>
          </div>
          
          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => selectedNotifications.forEach(onMarkAsRead)}
                disabled={isMarkingAsRead}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
              >
                <Check className="w-4 h-4" />
                Mark Read
              </button>
              <button
                onClick={() => selectedNotifications.forEach(onDelete)}
                disabled={isDeleting}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => {
          const IconComponent = typeIcons[notification.type] || AlertCircle;
          const isSelected = selectedNotifications.includes(notification._id);
          const isExpanded = expandedNotification === notification._id;
          const typeConfig = TYPE_BADGE_CONFIG[notification.type];
          const priorityConfig = PRIORITY_BADGE_CONFIG[notification.priority];

          return (
            <div
              key={notification._id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-blue-50/30' : ''
              } ${isSelected ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Selection checkbox */}
                <label className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection(notification._id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>

                {/* Notification icon */}
                <div className={`p-2 rounded-lg ${typeConfig.bg} ${typeConfig.border} border`}>
                  <IconComponent className={`w-5 h-5 ${typeConfig.text}`} />
                </div>

                {/* Notification content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-semibold ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}>
                          {typeConfig.label}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}>
                          {notification.priority}
                        </span>
                      </div>

                      <p className={`text-sm ${
                        !notification.read ? 'text-gray-700' : 'text-gray-600'
                      } ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {notification.message}
                      </p>

                      {notification.message.length > 100 && (
                        <button
                          onClick={() => toggleExpanded(notification._id)}
                          className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}

                      {/* Actions */}
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          {notification.actions.map((action, index) => (
                            <button
                              key={index}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                action.style === 'primary'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : action.style === 'danger'
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Link */}
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                        >
                          View details
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Timestamp and actions */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDate(notification.createdAt)}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => onMarkAsRead(notification._id)}
                            disabled={isMarkingAsRead}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Mark as read"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => onDelete(notification._id)}
                          disabled={isDeleting}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}