import { useState } from 'react';
import {
  Check, Trash2, Eye, Clock, AlertCircle, Package,
  CreditCard, Users, Settings, TrendingUp, ExternalLink,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { SellerNotification } from '@/types/seller/notifications';

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

const TYPE_ICONS: Record<string, any> = {
  order: Package, account: Users, product: Package, payment: CreditCard,
  inventory: Package, performance: TrendingUp, customer: Users, system: Settings,
};

function timeAgo(dateString: string) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-rose-400', medium: 'bg-amber-400', low: 'bg-[#9CA3AF]',
};

export function NotificationsList({
  notifications,
  selectedNotifications,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onMarkAsRead,
  onDelete,
  isMarkingAsRead,
  isDeleting,
}: NotificationsListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const allSelected = notifications.length > 0 && selectedNotifications.length === notifications.length;
  const someSelected = selectedNotifications.length > 0 && selectedNotifications.length < notifications.length;

  if (notifications.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-12 text-center">
        <div className="w-12 h-12 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-5 h-5 text-[#9CA3AF]" />
        </div>
        <h3 className="text-[14px] font-semibold text-[#111111] mb-1">All caught up</h3>
        <p className="text-[12px] text-[#9CA3AF]">No notifications at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-[#F3F4F6] bg-[#F8F9FA] flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            ref={el => { if (el) el.indeterminate = someSelected; }}
            onChange={() => allSelected ? onClearSelection() : onSelectAll()}
            className="w-3.5 h-3.5 border-[#D1D5DB] rounded accent-[#111111]"
          />
          <span className="text-[12px] text-[#555555] font-medium">
            {selectedNotifications.length > 0 ? `${selectedNotifications.length} selected` : 'Select all'}
          </span>
        </label>

        {selectedNotifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => selectedNotifications.forEach(onMarkAsRead)}
              disabled={isMarkingAsRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#374151] rounded-md hover:bg-[#F8F9FA] disabled:opacity-40 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Mark Read
            </button>
            <button
              onClick={() => selectedNotifications.forEach(onDelete)}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#FECACA] bg-white text-[12px] font-medium text-rose-600 rounded-md hover:bg-rose-50 disabled:opacity-40 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-[#F3F4F6]">
        {notifications.map((notification) => {
          const IconComponent = TYPE_ICONS[notification.type] || AlertCircle;
          const isSelected = selectedNotifications.includes(notification._id);
          const isExpanded = expanded === notification._id;
          const priorityDot = PRIORITY_DOT[notification.priority] || 'bg-[#9CA3AF]';

          return (
            <div
              key={notification._id}
              className={`px-4 py-4 transition-colors duration-100 ${isSelected ? 'bg-[#F8F9FA]' : !notification.read ? 'bg-[#FAFAFA]' : 'hover:bg-[#FAFAFA]'
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <label className="flex items-center mt-0.5 cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection(notification._id)}
                    className="w-3.5 h-3.5 border-[#D1D5DB] rounded accent-[#111111]"
                  />
                </label>

                {/* Icon */}
                <div className="w-8 h-8 bg-[#F3F4F6] border border-[#E5E7EB] rounded-md flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-4 h-4 text-[#6B7280]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`text-[13px] font-semibold truncate ${!notification.read ? 'text-[#111111]' : 'text-[#374151]'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot}`} />
                        )}
                      </div>

                      {/* Type + priority badges */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold border rounded capitalize bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280]">
                          {notification.type}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold border rounded capitalize bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280]">
                          {notification.priority}
                        </span>
                      </div>

                      <p className={`text-[12px] text-[#555555] ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {notification.message}
                      </p>

                      {notification.message.length > 100 && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : notification._id)}
                          className="text-[11px] text-[#6B7280] hover:text-[#111111] mt-1 flex items-center gap-1 transition-colors"
                        >
                          {isExpanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show more</>}
                        </button>
                      )}

                      {/* Action buttons from notification */}
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="flex items-center gap-2 mt-2.5">
                          {notification.actions.map((action, i) => (
                            <button
                              key={`${notification._id}-action-${i}`}
                              className={`px-3 py-1.5 text-[11px] font-medium rounded-md border transition-colors ${action.style === 'primary'
                                ? 'bg-[#111111] text-white border-[#111111] hover:bg-[#222222]'
                                : action.style === 'danger'
                                  ? 'border-[#FECACA] text-rose-600 bg-white hover:bg-rose-50'
                                  : 'border-[#E5E7EB] text-[#555555] bg-white hover:bg-[#F8F9FA]'
                                }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {notification.link && (
                        <a
                          href={notification.link}
                          className="inline-flex items-center gap-1 text-[11px] text-[#555555] hover:text-[#111111] mt-2 transition-colors"
                        >
                          View details <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Timestamp + row actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
                        <Clock className="w-3 h-3" />
                        {timeAgo(notification.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => onMarkAsRead(notification._id)}
                            disabled={isMarkingAsRead}
                            title="Mark as read"
                            className="p-1.5 rounded-md text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-40 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(notification._id)}
                          disabled={isDeleting}
                          title="Delete"
                          className="p-1.5 rounded-md text-[#9CA3AF] hover:text-rose-500 hover:bg-rose-50 disabled:opacity-40 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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