import { AdminSellersQueryRequest, SellerStatus } from "./AdminSellersSchemas";
import { PaginationResult } from "../../shared/types";

export interface AdminSeller {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  businessType?: string;
  status: SellerStatus;
  verified: boolean;
  commission: number;
  rating?: number;
  totalProducts: number;
  totalSales: number;
  revenue: number;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  inactive: number;
  verified: number;
  unverified: number;
  totalRevenue: number;
  totalCommission: number;
  avgRating: number;
  recentSellers: Array<{
    id: string;
    businessName: string;
    email: string;
    status: SellerStatus;
    createdAt: Date;
  }>;
}

export interface IAdminSellersRepository {
  findById(id: string): Promise<AdminSeller | null>;
  findMany(query: AdminSellersQueryRequest): Promise<PaginationResult<AdminSeller>>;
  getStats(period: string): Promise<SellerStats>;
  updateStatus(sellerId: string, status: SellerStatus, reason?: string): Promise<AdminSeller>;
  updateVerification(sellerId: string, verified: boolean): Promise<AdminSeller>;
}