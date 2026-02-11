import type {
  SellerOrder,
  SellerOrderStats,
  SellerOrderItem,
  SellerOrderAddress,
  SellerOrdersListResult,
  SellerOrdersDataResult,
} from '@/lib/domain/seller/orders/ISellerOrdersRepository';

import type {
  SellerOrdersQueryRequest as OrdersQuery,
  OrderStatusUpdateRequest as OrderStatusUpdate,
  OrderTrackingUpdateRequest as OrderTrackingUpdate,
  OrderNotesRequest as OrderNotes,
  OrderCancelRequest as OrderCancel,
} from '@/lib/domain/seller/orders/SellerOrdersSchemas';

export type {
  SellerOrder,
  SellerOrderStats,
  SellerOrderItem,
  SellerOrderAddress,
  SellerOrdersListResult,
  SellerOrdersDataResult,
};

export type {
  OrdersQuery,
  OrderStatusUpdate,
  OrderTrackingUpdate,
  OrderNotes,
  OrderCancel,
};

export type SellerOrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';

export interface SellerOrdersResponse {
  orders: SellerOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BulkOrderUpdate {
  orderIds: string[];
  status?: SellerOrderStatus;
  trackingNumber?: string;
  notes?: string;
}

export interface ExportOrdersOptions {
  format?: 'csv' | 'xlsx' | 'pdf';
  period?: string;
  startDate?: string;
  endDate?: string;
  status?: SellerOrderStatus;
}

export type OrderStats = SellerOrderStats;

export interface SellerOrderUIState {
  selectedOrders: string[];
  showFilters: boolean;
  expandedOrder: string | null;
  currentPage: number;
  toggleOrderSelection: (orderId: string) => void;
  selectAllOrders: (orderIds: string[]) => void;
  clearSelection: () => void;
  setShowFilters: (show: boolean) => void;
  setExpandedOrder: (orderId: string | null) => void;
  setCurrentPage: (page: number) => void;
  resetState: () => void;
}

export interface OrdersStatsProps {
  stats?: SellerOrderStats;
}

export interface OrdersListProps {
  orders: SellerOrder[];
  selectedOrders: string[];
  onToggleOrderSelection: (orderId: string) => void;
  onStatusChange: (orderId: string, status: SellerOrderStatus, trackingNumber?: string) => void;
  updateOrderStatus: any;
}

export interface OrdersPaginationProps {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderHeaderProps {
  order: SellerOrder;
  onStatusChange: (status: SellerOrderStatus) => void;
  onCancel: () => void;
  onBack: () => void;
  onPrint: () => void;
  updating: boolean;
}

export interface OrderProgressStepperProps {
  currentStatus: SellerOrderStatus;
}

export interface OrderItemsProps {
  items: SellerOrderItem[];
}

export interface PriceBreakdownProps {
  order: SellerOrder;
}

export interface OrderNotesProps {
  notes: string;
  isCancelled: boolean;
  onSave: (notes: string) => void;
  updating: boolean;
}

export interface CustomerInfoProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface ShippingAddressProps {
  shippingAddress: SellerOrderAddress;
}

export interface PaymentDeliveryInfoProps {
  order: SellerOrder;
  isCancelled: boolean;
  onSaveTracking: (trackingNumber: string) => void;
  updating: boolean;
}

export interface CancelOrderModalProps {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  updating: boolean;
}