// Seller Earnings Types
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
export type PayoutMethod = 'bank_transfer' | 'upi' | 'wallet';

export interface EarningsSummary {
  totalRevenue: number;
  completedRevenue: number;
  pendingRevenue: number;
  platformFees: number;
  growth: number;
  netEarnings?: number;
  totalOrders?: number;
  averageOrderValue?: number;
}

export interface EarningsTransaction {
  _id: string;
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  sellerAmount: number;
  platformFee: number;
  totalAmount: number;
  amount: number; // For backward compatibility
  status: TransactionStatus;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: string;
  productName?: string;
  quantity?: number;
}

export interface EarningsPayout {
  _id: string;
  sellerId: string;
  amount: number;
  method: PayoutMethod;
  status: PayoutStatus;
  accountDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    accountHolderName?: string;
    upiId?: string;
    walletId?: string;
  };
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  failureReason?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EarningsData {
  transactions: EarningsTransaction[];
  summary: EarningsSummary;
  analytics?: EarningsAnalytics;
}

export interface EarningsAnalytics {
  monthlyTrends: {
    month: string;
    revenue: number;
    orders: number;
    growth: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    revenue: number;
    orders: number;
  }[];
  revenueByCategory: {
    category: string;
    revenue: number;
    percentage: number;
  }[];
}

export interface EarningsTransactionsResponse {
  transactions: EarningsTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary?: {
    totalAmount: number;
    totalFees: number;
    netAmount: number;
  };
}

export interface EarningsPayoutsResponse {
  payouts: EarningsPayout[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary?: {
    totalRequested: number;
    totalPaid: number;
    totalPending: number;
  };
}

export interface EarningsFilters {
  page?: number;
  limit?: number;
  status?: TransactionStatus | 'all';
  period?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EarningsQuery {
  page?: number;
  limit?: number;
  status?: TransactionStatus | 'all';
  period?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PayoutFilters {
  page?: number;
  limit?: number;
  status?: PayoutStatus | 'all';
  method?: PayoutMethod | 'all';
  period?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PayoutRequest {
  amount: number;
  method: PayoutMethod;
  accountDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    accountHolderName?: string;
    upiId?: string;
    walletId?: string;
  };
  notes?: string;
}

export interface PayoutRequestData {
  amount: number;
  method: PayoutMethod;
  accountDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
    walletId?: string;
  };
}

// UI State interfaces
export interface EarningsUIState {
  activeTab: 'overview' | 'transactions' | 'payouts' | 'analytics';
  showFilters: boolean;
  selectedTransactions: string[];
  expandedTransaction: string | null;
  setActiveTab: (tab: 'overview' | 'transactions' | 'payouts' | 'analytics') => void;
  setShowFilters: (show: boolean) => void;
  setSelectedTransactions: (ids: string[]) => void;
  setExpandedTransaction: (id: string | null) => void;
  resetState: () => void;
}

// Component Props interfaces
export interface EarningsHeaderProps {
  period: string;
  onPeriodChange: (period: string) => void;
  onExport: () => void;
  isExporting: boolean;
}

export interface EarningsSummaryProps {
  summary?: EarningsSummary;
}

export interface EarningsOverviewProps {
  summary?: EarningsSummary;
  transactions: EarningsTransaction[];
  onRequestPayout: (amount: number, method: PayoutMethod, accountDetails?: any) => void;
  isRequestingPayout: boolean;
  getStatusBadge: (status: string) => string;
}

export interface EarningsTransactionsProps {
  transactions: EarningsTransaction[];
  filters: EarningsFilters;
  onFiltersChange: (filters: EarningsFilters) => void;
  getStatusBadge: (status: string) => string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
  onBulkAction?: (transactionIds: string[], action: 'export' | 'mark_reviewed') => void;
  isBulkProcessing?: boolean;
}

export interface EarningsPayoutsProps {
  payouts: EarningsPayout[];
  getStatusBadge: (status: string) => string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
  onCancelPayout?: (payoutId: string) => void;
  isCancelling?: boolean;
}

export interface EarningsAnalyticsProps {
  analytics?: EarningsAnalytics;
  period: string;
  onPeriodChange: (period: string) => void;
}

// Individual Component Props
export interface TransactionCardProps {
  transaction: EarningsTransaction;
  getStatusBadge: (status: string) => string;
  isSelected?: boolean;
  onSelect?: (transactionId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: (transactionId: string) => void;
}

export interface PayoutCardProps {
  payout: EarningsPayout;
  getStatusBadge: (status: string) => string;
  onCancel?: (payoutId: string) => void;
  isCancelling?: boolean;
}

export interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PayoutRequest) => void;
  availableAmount: number;
  isSubmitting: boolean;
}

export interface EarningsFiltersProps {
  filters: EarningsFilters;
  onFiltersChange: (filters: EarningsFilters) => void;
  onClearFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export interface PayoutFiltersProps {
  filters: PayoutFilters;
  onFiltersChange: (filters: PayoutFilters) => void;
  onClearFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

// Chart and Analytics interfaces
export interface RevenueChartProps {
  data: {
    month: string;
    revenue: number;
    orders: number;
  }[];
  period: string;
}

export interface EarningsMetricsProps {
  summary: EarningsSummary;
  period: string;
}

export interface TopProductsProps {
  products: {
    productId: string;
    productName: string;
    revenue: number;
    orders: number;
  }[];
}

// Export and Reporting interfaces
export interface EarningsExportData {
  period?: string;
  startDate?: string;
  endDate?: string;
  includeTransactions?: boolean;
  includePayouts?: boolean;
  includeSummary?: boolean;
  format?: 'csv' | 'xlsx' | 'pdf';
}

export interface EarningsReportProps {
  data: EarningsData;
  period: string;
  onExport: (options: EarningsExportData) => void;
  isExporting: boolean;
}

// Bulk Operations interfaces
export interface BulkTransactionAction {
  transactionIds: string[];
  action: 'export' | 'mark_reviewed';
  data?: any;
}

export interface BulkTransactionActionsProps {
  selectedTransactions: string[];
  onBulkExport: (transactionIds: string[]) => void;
  onClearSelection: () => void;
  isProcessing: boolean;
}

// Status Badge Helper
export interface StatusBadgeConfig {
  [key: string]: {
    bg: string;
    text: string;
    border: string;
  };
}

// Period Options
export interface PeriodOption {
  value: string;
  label: string;
  days?: number;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: '7days', label: 'Last 7 days', days: 7 },
  { value: '30days', label: 'Last 30 days', days: 30 },
  { value: '90days', label: 'Last 90 days', days: 90 },
  { value: '1year', label: 'Last year', days: 365 },
  { value: 'custom', label: 'Custom range' }
];

// Status Badge Configurations
export const TRANSACTION_STATUS_BADGES: StatusBadgeConfig = {
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  failed: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  }
};

export const PAYOUT_STATUS_BADGES: StatusBadgeConfig = {
  paid: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  processing: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  failed: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  }
};