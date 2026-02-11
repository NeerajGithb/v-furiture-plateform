// Seller Notifications Types
export type NotificationType = 'order' | 'account' | 'product' | 'payment' | 'inventory' | 'performance' | 'customer' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationChannel = 'app' | 'email' | 'sms' | 'whatsapp';
export type NotificationActionStyle = 'primary' | 'secondary' | 'danger';

export interface NotificationAction {
  label: string;
  action: string;
  style: NotificationActionStyle;
}

export interface NotificationMetadata {
  orderId?: string;
  productId?: string;
  reviewId?: string;
  payoutId?: string;
  customerId?: string;
  amount?: number;
  quantity?: number;
  [key: string]: any;
}

export interface SellerNotification {
  _id: string;
  id: string; // Added for frontend consistency (Rule F13)
  type: NotificationType;
  subType: string;
  title: string;
  message: string;
  link?: string;
  actions?: NotificationAction[];
  metadata?: NotificationMetadata;
  read: boolean;
  dismissed: boolean;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  createdAt: string;
  readAt?: string;
  dismissedAt?: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  dismissed: number;
  byType: {
    order: number;
    account: number;
    product: number;
    payment: number;
    inventory: number;
    performance: number;
    customer: number;
    system: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recentActivity: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface NotificationsResponse {
  notifications: SellerNotification[];
  stats: NotificationStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  search?: string;
  read?: boolean;
  dismissed?: boolean;
  type?: NotificationType | 'all';
  priority?: NotificationPriority | 'all';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  read?: boolean;
  dismissed?: boolean;
  type?: NotificationType | 'all';
  priority?: NotificationPriority | 'all';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UnreadCountResponse {
  count: number;
}

// UI State interfaces
export interface NotificationsUIState {
  selectedNotifications: string[];
  expandedNotification: string | null;
  showFilters: boolean;
  bulkActionMode: boolean;
  setSelectedNotifications: (ids: string[]) => void;
  setExpandedNotification: (id: string | null) => void;
  setShowFilters: (show: boolean) => void;
  setBulkActionMode: (mode: boolean) => void;
  toggleNotificationSelection: (id: string) => void;
  selectAllNotifications: (notifications: SellerNotification[]) => void;
  clearSelection: () => void;
  resetState: () => void;
}

// Component Props interfaces
export interface NotificationHeaderProps {
  unreadCount: number;
  selectedNotifications: string[];
  markAllAsRead: any; // Mutation object
  bulkDelete: any; // Mutation object
  clearAll: any; // Mutation object
  onBulkDelete: () => void;
}

export interface NotificationStatsProps {
  stats?: NotificationStats;
}

export interface NotificationFiltersProps {
  readFilter: 'all' | 'unread';
  setReadFilter: (filter: 'all' | 'unread') => void;
  sortFilter: 'newest' | 'oldest';
  setSortFilter: (filter: 'newest' | 'oldest') => void;
  typeFilter: string;
  setTypeFilter: (filter: string) => void;
  priorityFilter: string;
  setPriorityFilter: (filter: string) => void;
}

export interface NotificationListProps {
  notifications: SellerNotification[];
  selectedNotifications: string[];
  toggleNotificationSelection: (id: string) => void;
  selectAllNotifications: () => void;
  clearSelection: () => void;
  markAsRead: any; // Mutation object
  deleteNotification: any; // Mutation object
}

export interface NotificationCardProps {
  notification: SellerNotification;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingAsRead?: boolean;
  isDeleting?: boolean;
}

export interface NotificationActionButtonProps {
  action: NotificationAction;
  notificationId: string;
  onActionClick: (notificationId: string, action: string) => void;
  isProcessing?: boolean;
}

// Bulk Operations interfaces
export interface BulkNotificationAction {
  notificationIds: string[];
  action: 'mark_read' | 'mark_unread' | 'delete' | 'dismiss';
}

export interface BulkNotificationActionsProps {
  selectedNotifications: string[];
  onBulkMarkAsRead: (ids: string[]) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkDismiss: (ids: string[]) => void;
  onClearSelection: () => void;
  isProcessing: boolean;
}

// Priority Badge Configuration
export interface PriorityBadgeConfig {
  low: {
    bg: string;
    text: string;
    border: string;
    icon?: string;
  };
  medium: {
    bg: string;
    text: string;
    border: string;
    icon?: string;
  };
  high: {
    bg: string;
    text: string;
    border: string;
    icon?: string;
  };
  critical: {
    bg: string;
    text: string;
    border: string;
    icon?: string;
  };
}

export const PRIORITY_BADGE_CONFIG: PriorityBadgeConfig = {
  low: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  },
  medium: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  high: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  }
};

// Type Badge Configuration
export interface TypeBadgeConfig {
  order: {
    bg: string;
    text: string;
    border: string;
    icon?: string;
    label: string;
  };
  account: {
    bg: string;
    text: string;
    border: string;
    icon?: string;
    label: string;
  };
  product: {
    bg: string;
    text: string;
    border: string;
    icon?: string;
    label: string;
  };
  payment: {
    bg: string;
    text: string;
    border: string;
    icon?: string;
    label: string;
  };
  inventory: {
    bg: string;
    text: string;
    border: string;
    icon?: string;
    label: string;
  };
  performance: {
    bg: string;
    text: string;
    border: string;
    icon?: string;
    label: string;
  };
  customer: {
    bg: string;
    text: string;
    border: string;
    icon?: string;
    label: string;
  };
  system: {
    bg: string;
    text: string;
    border: string;
    icon?: string;
    label: string;
  };
}

export const TYPE_BADGE_CONFIG: TypeBadgeConfig = {
  order: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    label: 'Order'
  },
  account: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    label: 'Account'
  },
  product: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    label: 'Product'
  },
  payment: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    label: 'Payment'
  },
  inventory: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    label: 'Inventory'
  },
  performance: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    label: 'Performance'
  },
  customer: {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    border: 'border-pink-200',
    label: 'Customer'
  },
  system: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    label: 'System'
  }
};

// Filter Options
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export const NOTIFICATION_TYPE_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All Types' },
  { value: 'order', label: 'Orders' },
  { value: 'account', label: 'Account' },
  { value: 'product', label: 'Products' },
  { value: 'payment', label: 'Payments' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'performance', label: 'Performance' },
  { value: 'customer', label: 'Customer' },
  { value: 'system', label: 'System' }
];

export const NOTIFICATION_PRIORITY_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

// Notification Templates
export interface NotificationTemplate {
  type: NotificationType;
  subType: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  actions?: NotificationAction[];
}

// Real-time Updates
export interface NotificationUpdate {
  type: 'new' | 'read' | 'deleted' | 'updated';
  notification?: SellerNotification;
  notificationId?: string;
  count?: number;
}

// Analytics interfaces
export interface NotificationAnalytics {
  totalNotifications: number;
  readRate: number;
  averageReadTime: number;
  mostActiveTypes: {
    type: NotificationType;
    count: number;
    percentage: number;
  }[];
  dailyActivity: {
    date: string;
    notifications: number;
    reads: number;
  }[];
  responseRate: number;
}

export interface NotificationAnalyticsProps {
  analytics: NotificationAnalytics;
  period: string;
  onPeriodChange: (period: string) => void;
}