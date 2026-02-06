export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalReviews: number;
  averageRating: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: Date;
  }>;
  recentReviews: Array<{
    id: string;
    productName: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  salesTrend: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export interface EarningsData {
  totalEarnings: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  earningsHistory: Array<{
    date: string;
    amount: number;
    orders: number;
  }>;
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
}

export interface ProductStats {
  total: number;
  published: number;
  draft: number;
  outOfStock: number;
  lowStock: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ReviewStats {
  total: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentReviews: Array<{
    id: string;
    productName: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
}

export interface ISellerDashboardRepository {
  // Dashboard data
  getDashboardStats(sellerId: string, period?: string): Promise<DashboardStats>;
  getEarningsData(sellerId: string, period?: string): Promise<EarningsData>;
  
  // Stats by category
  getOrderStats(sellerId: string, period?: string): Promise<OrderStats>;
  getProductStats(sellerId: string, period?: string): Promise<ProductStats>;
  getReviewStats(sellerId: string, period?: string): Promise<ReviewStats>;
  
  // Analytics
  getSalesTrend(sellerId: string, startDate: Date, endDate: Date, groupBy: string): Promise<Array<{
    date: string;
    sales: number;
    orders: number;
  }>>;
}