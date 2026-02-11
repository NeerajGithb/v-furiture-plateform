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
    productId: {
      id: string;
      name: string;
      sku: string;
      mainImage?: {
        url: string;
        alt?: string;
      };
    };
    quantity: number;
    price: number;
    sellerId: {
      id: string;
      businessName: string;
      email: string;
    };
  }>;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
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
  priceBreakdown?: {
    subtotal: number;
    couponDiscount?: number;
    shipping: number;
    tax: number;
    total: number;
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
}

export interface IAdminOrdersRepository {
  findMany(query: AdminOrdersQueryRequest): Promise<PaginationResult<AdminOrder>>;
  getStats(period: string): Promise<OrderStats>;
  exportOrders(query: AdminOrdersQueryRequest): Promise<AdminOrder[]>;
}