import { 
  SellerOrdersQueryRequest, 
  OrderStatusUpdateRequest,
  OrderTrackingUpdateRequest,
  OrderNotesRequest,
  OrderCancelRequest
} from "./SellerOrdersSchemas";

export interface SellerOrder {
  id: string;
  orderNumber: string;
  userId: {
    id: string;
    name: string;
    email: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    id: string;
    productId: {
      id: string;
      name: string;
      mainImage?: any;
      slug?: string;
    };
    name: string;
    price: number;
    quantity: number;
    productImage: string;
    selectedVariant?: any;
    sku?: string;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
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
  trackingNumber?: string;
  estimatedDelivery?: Date;
  expectedDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
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

export interface SellerOrdersListResult {
  orders: SellerOrder[];
  total: number;
}

export interface SellerOrdersDataResult {
  orders?: SellerOrder[];
  stats: SellerOrderStats;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ISellerOrdersRepository {
  // Order queries
  getOrdersList(sellerId: string, options: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    period?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<SellerOrdersListResult>;
  
  getOrderById(sellerId: string, orderId: string): Promise<SellerOrder>;
  
  getOrdersStats(sellerId: string, filters: {
    status?: string;
    period?: string;
  }): Promise<SellerOrderStats>;
  
  // Order management
  updateOrderStatus(sellerId: string, orderId: string, updates: OrderStatusUpdateRequest): Promise<any>;
  updateOrderTracking(sellerId: string, orderId: string, trackingData: OrderTrackingUpdateRequest): Promise<any>;
  addOrderNotes(sellerId: string, orderId: string, notesData: OrderNotesRequest): Promise<any>;
  cancelOrder(sellerId: string, orderId: string, cancelData: OrderCancelRequest): Promise<any>;
  
  // Bulk operations
  bulkUpdateOrders(sellerId: string, orderIds: string[], updates: any): Promise<{
    updatedCount: number;
    message: string;
  }>;
  
  // Export
  getOrdersExportData(sellerId: string, filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]>;
}