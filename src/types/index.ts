// Export all types from a central location

// Common types
export * from './common';

// Admin types  
export * from './admin';

// Product types
export * from './product';
export * from './adminProduct';

// Order types
export * from './order';

// Review types
export * from './review';

// Coupon types
export * from './coupon';

// Analytics types
export * from './analytics';

// Finance types
export * from './finance';

// Seller types
export * from './seller';

// Seller Dashboard types
export * from './sellerDashboard';

// Seller Profile types
export * from './sellerProfile';

// Seller Products types
export * from './sellerProducts';

// Seller Order types
export * from './sellerOrder';

// Seller Inventory types
export * from './sellerInventory';

// User types
export * from './user';

// Re-export commonly used types with aliases for convenience
export type { 
  TimePeriod,
  SortOrder,
  FilterParams,
  ApiResponse,
  PaginatedApiResponse
} from './common';

export type {
  AdminDashboardStats,
  MainStatsCardsProps,
  TopProductsProps,
  RecentActivityProps
} from './admin';

export type {
  Product,
  ProductApprovalStatus,
  ProductFormData
} from './product';

export type {
  ProductStats,
  ProductsResponse
} from './adminProduct';

export type {
  AdminOrder,
  OrderStats,
  OrdersResponse,
  OrderFilters,
  OrderUIState,
  OrdersOverviewProps,
  OrdersTableProps
} from './order';

export type {
  AdminReview,
  ReviewStats,
  ReviewsResponse,
  ReviewFilters,
  ReviewUIState,
  ReviewsOverviewProps,
  ReviewsTableProps
} from './review';

export type {
  AdminCoupon,
  CouponStats,
  CouponsResponse,
  CouponFilters,
  CouponFormData,
  CouponUIState,
  CouponsOverviewProps,
  CouponsTableProps,
  CouponFormModalProps
} from './coupon';

export type {
  AdminAnalyticsStats,
  AnalyticsFilters,
  AnalyticsResponse,
  AnalyticsUIState,
  StatsCardsProps,
  OrderStatusBreakdownProps,
  ProductAnalyticsProps,
  SearchAnalyticsProps,
  EngagementMetricsProps
} from './analytics';

export type {
  FinanceData,
  FinanceTransaction,
  FinancialSummary,
  FinancialStats,
  FinancialBreakdown,
  FinanceResponse,
  FinanceFilters,
  FinanceUIState,
  FinanceOverviewProps,
  FinanceTransactionsTableProps,
  FinanceStatsCardsProps,
  FinanceBreakdownProps
} from './finance';

export type {
  AdminSeller,
  SellersResponse,
  SellerResponse,
  SellerUIState
} from './seller';

export type {
  SellerDashboardStats,
  SellerProductStats,
  SellerOrderStats,
  SellerRevenueStats,
  SellerEarningsStats,
  SellerReviewStats,
  SellerAnalyticsStats,
  SellerRecentOrder,
  SellerDashboardResponse,
  SellerDashboardParams,
  SellerDashboardUIState,
  SellerDashboardOverviewProps,
  SellerStatsCardsProps,
  SellerOrderStatusProps,
  SellerRecentOrdersProps
} from './sellerDashboard';

export type {
  SellerProfile,
  SellerDocument,
  SellerProfileStats,
  ProfileUpdateData,
  DocumentUploadData,
  PasswordChangeData,
  SellerProfileResponse,
  SellerProfileStatsResponse,
  DocumentUploadResponse,
  SellerProfileUIState,
  ProfileOverviewProps,
  BusinessInformationProps,
  SecuritySettingsProps,
  VerificationStatusProps,
  DocumentManagementProps
} from './sellerProfile';

export type {
  SellerProduct,
  SellerProductStats,
  ProductFormData,
  ProductUpdateData,
  ProductBulkUpdateData,
  ProductsResponse,
  SingleProductResponse,
  ProductStatsResponse,
  ProductFilters,
  SellerProductUIState,
  ProductsHeaderProps,
  ProductsFiltersProps,
  ProductsGridProps,
  ProductDetailHeaderProps,
  ProductImageGalleryProps,
  ProductAnalyticsProps,
  ProductInformationProps,
  ProductCardProps
} from './sellerProducts';

export type {
  SellerOrder,
  SellerOrderItem,
  SellerOrderStats,
  SellerOrdersResponse,
  SellerOrderFilters,
  SellerOrderUpdateData,
  SellerOrderUIState,
  OrdersHeaderProps,
  OrdersStatsProps,
  OrdersFiltersProps,
  OrdersListProps,
  OrdersPaginationProps,
  OrderHeaderProps,
  OrderProgressStepperProps,
  OrderItemsProps,
  PriceBreakdownProps,
  OrderNotesProps,
  CustomerInfoProps,
  ShippingAddressProps,
  PaymentDeliveryInfoProps,
  CancelOrderModalProps
} from './sellerOrder';

export type {
  InventoryItem,
  InventoryStats,
  InventoryResponse,
  InventoryFilters,
  StockUpdateData,
  BulkStockUpdateData,
  InventoryUIState,
  InventoryHeaderProps,
  InventoryStatsProps,
  InventoryFiltersProps,
  InventoryTableProps,
  InventoryPaginationProps,
  StockAdjustmentModalProps,
  BulkStockModalProps,
  ReorderLevelModalProps,
  StockHistoryEntry,
  StockHistoryProps,
  LowStockAlert,
  LowStockAlertsProps
} from './sellerInventory';

export type {
  AdminUser,
  UsersResponse,
  UserResponse,
  UserUIState
} from './user';