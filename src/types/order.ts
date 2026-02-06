// Order Types for Admin System
import { OrderStatus } from './common';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';

export interface OrderAddress {
  fullName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
}

export interface OrderUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface OrderProduct {
  _id: string;
  name: string;
  sku?: string;
  mainImage?: {
    url: string;
    alt: string;
  };
}

export interface OrderSeller {
  _id: string;
  businessName: string;
  email: string;
  phone?: string;
}

export interface OrderItem {
  _id: string;
  productId: OrderProduct;
  sellerId: OrderSeller;
  quantity: number;
  price: number;
  finalPrice: number;
  discountAmount?: number;
  status: OrderStatus;
  trackingNumber?: string;
}

export interface PriceBreakdown {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponDiscount?: number;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  userId: OrderUser;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  trackingNumber?: string;
  expectedDeliveryDate?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  priceBreakdown: PriceBreakdown;
  couponCode?: string;
  couponDiscount?: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  issues: number;
  totalRevenue: number;
  averageOrderValue: number;
  paymentStats: {
    paid: number;
    pending: number;
    failed: number;
    refunded: number;
  };
}

export interface OrdersResponse {
  orders: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  period?: string;
  sellerId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Admin Orders Query interface for hooks
export interface AdminOrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  period?: string;
  sellerId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// Admin Order Update interface for hooks
export interface AdminOrderUpdate {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  notes?: string;
  expectedDeliveryDate?: string;
}

// Admin Order Bulk Update interface for hooks
export interface AdminOrderBulkUpdate {
  orderIds: string[];
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

// Admin Order Bulk Update Response interface
export interface AdminOrderBulkUpdateResponse {
  message: string;
  updatedCount: number;
  failedCount?: number;
  errors?: string[];
}

// UI State interfaces
export interface OrderUIState {
  expandedOrder: string | null;
  activeTab: string;
  setExpandedOrder: (orderId: string | null) => void;
  setActiveTab: (tab: string) => void;
}

// Component Props interfaces
export interface OrdersOverviewProps {
  stats: OrderStats;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export interface OrdersTableProps {
  orders: AdminOrder[];
  expandedOrder: string | null;
  onToggleExpand: (orderId: string) => void;
}