import { AdminOrdersQueryRequest, OrderStatus, PaymentStatus } from "./AdminOrdersSchemas";
import { PaginationResult } from "../../shared/types";

export interface AdminOrder {
  id: string;
  orderNumber: string;
  userId: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    sellerId: string;
    sellerName: string;
  }>;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  avgOrderValue: number;
  byStatus: Array<{
    status: OrderStatus;
    count: number;
    revenue: number;
  }>;
  byPaymentStatus: Array<{
    status: PaymentStatus;
    count: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: Date;
  }>;
}

export interface OrderTrend {
  date: string;
  orders: number;
  revenue: number;
  avgOrderValue: number;
}

export interface IAdminOrdersRepository {
  // Order queries
  findById(id: string): Promise<AdminOrder | null>;
  findByOrderNumber(orderNumber: string): Promise<AdminOrder | null>;
  findMany(query: AdminOrdersQueryRequest): Promise<PaginationResult<AdminOrder>>;
  getStats(period: string): Promise<OrderStats>;
  getTrends(startDate: Date, endDate: Date, groupBy: string): Promise<OrderTrend[]>;
  
  // Order management
  updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<AdminOrder>;
  updatePaymentStatus(orderId: string, status: PaymentStatus, notes?: string): Promise<AdminOrder>;
  addTrackingNumber(orderId: string, trackingNumber: string): Promise<AdminOrder>;
  updateEstimatedDelivery(orderId: string, estimatedDelivery: Date): Promise<AdminOrder>;
  
  // Export
  exportOrders(query: AdminOrdersQueryRequest): Promise<AdminOrder[]>;
}