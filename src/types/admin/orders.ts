// Re-export types from backend domain layer for frontend use
import type {
    AdminOrder,
    OrderStats,
} from '@/lib/domain/admin/orders/IAdminOrdersRepository';

import type {
    OrderStatus,
    PaymentStatus,
    AdminOrdersQueryRequest,
    OrderStatusUpdateRequest,
    OrderPaymentUpdateRequest,
    OrderStatsQueryRequest,
    OrderExportRequest,
} from '@/lib/domain/admin/orders/AdminOrdersSchemas';

export type {
    AdminOrder,
    OrderStats,
    OrderStatus,
    PaymentStatus,
    AdminOrdersQueryRequest,
    OrderStatusUpdateRequest,
    OrderPaymentUpdateRequest,
    OrderStatsQueryRequest,
    OrderExportRequest,
};

// Additional types for frontend operations (not in domain layer)
export interface AdminOrderUpdate {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  notes?: string;
  expectedDeliveryDate?: string;
}

export interface AdminOrderBulkUpdate {
  orderIds: string[];
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

export interface AdminOrderBulkUpdateResponse {
  message: string;
  updatedCount: number;
  failedCount?: number;
  errors?: string[];
}

// Component Props interfaces
export interface OrdersTableProps {
  orders: AdminOrder[];
  expandedOrder: string | null;
  onToggleExpand: (orderId: string) => void;
}

export interface OrdersOverviewProps {
  stats: OrderStats;
  onTabChange: (tab: string) => void;
  activeTab: string;
}
