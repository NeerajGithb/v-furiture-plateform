// Seller Order Types
export type SellerOrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';

export interface SellerOrderUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface SellerOrderProduct {
  _id: string;
  name: string;
  mainImage?: { 
    url: string; 
    alt?: string; 
  };
  slug?: string;
  sku?: string;
}

export interface SellerOrderItem {
  _id: string;
  productId: SellerOrderProduct | string;
  name: string;
  price: number;
  quantity: number;
  productImage?: string;
  selectedVariant?: any;
  sku?: string;
}

export interface SellerOrderAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SellerOrder {
  _id: string;
  orderNumber: string;
  userId: SellerOrderUser;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: SellerOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  totalAmount: number;
  orderStatus: SellerOrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: SellerOrderAddress;
  trackingNumber?: string;
  estimatedDelivery?: string;
  expectedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface SellerOrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
}

export interface SellerOrdersResponse {
  orders: SellerOrder[];
  stats?: SellerOrderStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SellerOrderFilters {
  status?: SellerOrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrdersQuery {
  status?: SellerOrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderStatusUpdate {
  status: SellerOrderStatus;
  trackingNumber?: string;
  notes?: string;
}

export interface OrderTrackingUpdate {
  trackingNumber: string;
  estimatedDelivery?: string;
}

export interface OrderNotes {
  notes: string;
}

export interface OrderCancel {
  reason: string;
  notes?: string;
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

export interface SellerOrderUpdateData {
  orderStatus?: SellerOrderStatus;
  trackingNumber?: string;
  notes?: string;
  estimatedDelivery?: string;
}

// UI State interfaces
export interface SellerOrderUIState {
  selectedOrders: string[];
  showFilters: boolean;
  expandedOrder: string | null;
  toggleOrderSelection: (orderId: string) => void;
  selectAllOrders: (orderIds: string[]) => void;
  clearSelection: () => void;
  setShowFilters: (show: boolean) => void;
  setExpandedOrder: (orderId: string | null) => void;
  resetState: () => void;
}

// Component Props interfaces
export interface OrdersHeaderProps {
  selectedOrders: string[];
  onBulkStatusUpdate: (status: SellerOrderStatus) => void;
  onExport: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  bulkUpdateOrders: any;
  exportOrders: any;
}

export interface OrdersStatsProps {
  stats?: SellerOrderStats;
}

export interface OrdersFiltersProps {
  filterStatus: string;
  setFilterStatus: (status?: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
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

// Single Order Page Types
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