import { TimePeriod, ApiResponse, PaginatedApiResponse } from './common';

// Finance Transaction Types
export interface FinanceTransaction {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  platformFee: number;
  payout: number;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  updatedAt?: string;
}

// Financial Summary Types
export interface FinancialSummary {
  totalRevenue: number;
  completedRevenue: number;
  pendingRevenue: number;
  platformFees: number;
  completedPayouts: number;
  pendingPayouts: number;
  totalPayouts: number;
  revenueGrowth: number;
}

// Financial Stats Types
export interface FinancialStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalPayments: number;
}

// Financial Breakdown Types
export interface FinancialBreakdown {
  paymentMethods: Record<string, { count: number; amount: number }>;
  orderStatus: Record<string, { count: number; amount: number }>;
}

// Main Finance Data Response
export interface FinanceData {
  summary: FinancialSummary;
  stats: FinancialStats;
  breakdown: FinancialBreakdown;
  transactions: FinanceTransaction[];
}

// Finance API Response Types
export interface FinanceResponse extends ApiResponse {
  data: FinanceData;
}

export interface FinanceTransactionsResponse extends PaginatedApiResponse {
  data: {
    transactions: FinanceTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Finance Filter Types
export interface FinanceFilters {
  period: TimePeriod;
  paymentStatus?: string;
  orderStatus?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

// Finance Service Parameters
export interface FinanceServiceParams {
  period?: TimePeriod;
  filters?: Partial<FinanceFilters>;
}

// Finance UI State Types
export interface FinanceUIState {
  selectedTransaction: string | null;
  showTransactionDetails: boolean;
  selectedPeriod: TimePeriod;
  
  // UI Actions
  setSelectedTransaction: (transactionId: string | null) => void;
  setShowTransactionDetails: (show: boolean) => void;
  setSelectedPeriod: (period: TimePeriod) => void;
  reset: () => void;
}

// Finance Component Props Types
export interface FinanceOverviewProps {
  summary: FinancialSummary;
  stats: FinancialStats;
  isLoading?: boolean;
}

export interface FinanceTransactionsTableProps {
  transactions: FinanceTransaction[];
  isLoading?: boolean;
  onTransactionSelect?: (transactionId: string) => void;
}

export interface FinanceStatsCardsProps {
  summary: FinancialSummary;
  stats: FinancialStats;
  isLoading?: boolean;
}

export interface FinanceBreakdownProps {
  breakdown: FinancialBreakdown;
  isLoading?: boolean;
}

// Finance Export Types
export interface FinanceExportParams {
  period: TimePeriod;
  format?: 'csv' | 'xlsx' | 'pdf';
  filters?: Partial<FinanceFilters>;
}

// Finance Report Types
export interface FinanceReportData {
  summary: FinancialSummary;
  transactions: FinanceTransaction[];
  generatedAt: string;
  period: TimePeriod;
  filters?: Partial<FinanceFilters>;
}

// Admin Finance Types
export interface AdminFinanceData {
  summary: FinancialSummary;
  stats: FinancialStats;
  breakdown: FinancialBreakdown;
  transactions: FinanceTransaction[];
}

export interface AdminFinanceQuery {
  period?: TimePeriod;
  paymentStatus?: string;
  orderStatus?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AdminPayoutUpdate {
  status?: string;
  notes?: string;
  processedBy?: string;
  processedAt?: string;
}

export interface AdminFinanceStats {
  totalRevenue: number;
  completedRevenue: number;
  pendingRevenue: number;
  platformFees: number;
  completedPayouts: number;
  pendingPayouts: number;
  totalPayouts: number;
  revenueGrowth: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalPayments: number;
}