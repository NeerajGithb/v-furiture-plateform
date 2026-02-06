// Analytics Types for Admin System

export interface RevenueAnalytics {
  total: number;
  completed: number;
  pending: number;
  paid: number;
  avgOrderValue: number;
  growth: number;
  monthlyRevenue?: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topSellingProducts?: Array<{
    productId: string;
    productName: string;
    revenue: number;
    unitsSold: number;
  }>;
}

export interface OrderAnalytics {
  total: number;
  confirmed: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned?: number;
  refunded?: number;
  dailyOrders?: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  ordersByStatus?: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface ProductAnalytics {
  total: number;
  published: number;
  draft?: number;
  archived?: number;
  totalViews: number;
  totalSold: number;
  totalWishlisted: number;
  totalCart: number;
  averageRating?: number;
  topProducts?: Array<{
    productId: string;
    name: string;
    views: number;
    sales: number;
    revenue: number;
    rating: number;
  }>;
  categoryPerformance?: Array<{
    categoryId: string;
    categoryName: string;
    productCount: number;
    totalSales: number;
    revenue: number;
  }>;
}

export interface UserAnalytics {
  total: number;
  verified: number;
  unverified?: number;
  active?: number;
  inactive?: number;
  uniqueCustomers: number;
  growth: number;
  newUsersToday?: number;
  newUsersThisWeek?: number;
  newUsersThisMonth?: number;
  usersByRegion?: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
  userActivity?: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
  }>;
}

export interface SellerAnalytics {
  total: number;
  active: number;
  pending: number;
  verified?: number;
  suspended?: number;
  topSellers?: Array<{
    sellerId: string;
    businessName: string;
    totalSales: number;
    revenue: number;
    rating: number;
  }>;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  averageResultsPerSearch?: number;
  noResultsRate?: number;
  topSearches: Array<{
    query: string;
    count: number;
    resultsFound: number;
  }>;
  searchTrends?: Array<{
    date: string;
    searches: number;
    uniqueQueries: number;
  }>;
  popularCategories?: Array<{
    category: string;
    searchCount: number;
  }>;
}

export interface EngagementAnalytics {
  totalAddedToCart: number;
  totalAddedToWishlist: number;
  cartAbandonmentRate: number;
  conversionRate: number;
  averageSessionDuration?: number;
  bounceRate?: number;
  pageViews?: number;
  uniqueVisitors?: number;
  clickThroughRate?: number;
  engagementByPage?: Array<{
    page: string;
    views: number;
    timeSpent: number;
    bounceRate: number;
  }>;
}

export interface ReviewAnalytics {
  total: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  avgRating: number;
  ratingDistribution?: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  reviewTrends?: Array<{
    date: string;
    reviews: number;
    avgRating: number;
  }>;
}

export interface GrowthAnalytics {
  revenue: number;
  orders: number;
  users: number;
  products?: number;
  sellers?: number;
  monthlyGrowth?: Array<{
    month: string;
    revenueGrowth: number;
    orderGrowth: number;
    userGrowth: number;
  }>;
}

export interface AdminAnalyticsStats {
  period?: string;
  revenue: RevenueAnalytics;
  orders: OrderAnalytics;
  products: ProductAnalytics;
  users: UserAnalytics;
  sellers: SellerAnalytics;
  search: SearchAnalytics;
  engagement: EngagementAnalytics;
  reviews: ReviewAnalytics;
  growth: GrowthAnalytics;
  lastUpdated?: string;
}

export interface AnalyticsFilters {
  period?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  seller?: string;
  region?: string;
  metric?: string;
}

export interface AdminAnalyticsQuery {
  period?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  seller?: string;
  region?: string;
  metric?: string;
}

export interface AdminAnalyticsData {
  period?: string;
  revenue: RevenueAnalytics;
  orders: OrderAnalytics;
  products: ProductAnalytics;
  users: UserAnalytics;
  sellers: SellerAnalytics;
  search: SearchAnalytics;
  engagement: EngagementAnalytics;
  reviews: ReviewAnalytics;
  growth: GrowthAnalytics;
  lastUpdated?: string;
}

export interface AnalyticsResponse {
  stats: AdminAnalyticsStats;
  filters?: AnalyticsFilters;
}

// UI State interfaces
export interface AnalyticsUIState {
  selectedMetric: string;
  showDetailedView: boolean;
  expandedSections: string[];
  setSelectedMetric: (metric: string) => void;
  setShowDetailedView: (show: boolean) => void;
  toggleSection: (section: string) => void;
  reset: () => void;
}

// Component Props interfaces
export interface StatsCardsProps {
  revenue: RevenueAnalytics;
  orders: OrderAnalytics;
  products: ProductAnalytics;
  users: UserAnalytics;
  growth: GrowthAnalytics;
  selectedMetric: string;
  onMetricSelect: (metric: string) => void;
}

export interface OrderStatusBreakdownProps {
  orders: OrderAnalytics;
}

export interface ProductAnalyticsProps {
  products: ProductAnalytics;
  reviews: ReviewAnalytics;
}

export interface SearchAnalyticsProps {
  search: SearchAnalytics;
}

export interface EngagementMetricsProps {
  engagement: EngagementAnalytics;
}