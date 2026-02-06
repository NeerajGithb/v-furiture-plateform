import { FinanceQueryRequest, PayoutQueryRequest, PayoutCreateRequest, PayoutUpdateRequest } from "./AdminFinanceSchemas";
import { PaginationResult } from "../../shared/types";

export interface FinanceOverview {
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
  pendingPayouts: number;
  netProfit: number;
  revenueGrowth: number;
  commissionRate: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  commission: number;
  orders: number;
  sellers: number;
}

export interface AdminPayout {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  requestedAt: Date;
  processedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalAmount: number;
  pendingAmount: number;
}

export interface IAdminFinanceRepository {
  // Finance overview
  getFinanceOverview(query: FinanceQueryRequest): Promise<FinanceOverview>;
  getRevenueData(query: FinanceQueryRequest): Promise<RevenueData[]>;
  
  // Payouts
  getPayouts(query: PayoutQueryRequest): Promise<PaginationResult<AdminPayout>>;
  getPayoutById(id: string): Promise<AdminPayout | null>;
  getPayoutStats(): Promise<PayoutStats>;
  
  // Payout management
  createPayout(data: PayoutCreateRequest): Promise<AdminPayout>;
  updatePayout(id: string, data: PayoutUpdateRequest): Promise<AdminPayout>;
  approvePayout(id: string): Promise<AdminPayout>;
  rejectPayout(id: string, reason: string): Promise<AdminPayout>;
  
  // Analytics
  getTopSellersByRevenue(limit: number): Promise<Array<{
    sellerId: string;
    sellerName: string;
    revenue: number;
    commission: number;
    orders: number;
  }>>;
  
  getRevenueByCategory(): Promise<Array<{
    categoryId: string;
    categoryName: string;
    revenue: number;
    percentage: number;
  }>>;
}