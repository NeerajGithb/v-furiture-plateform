// Seller Types
import { SellerStatus } from './common';

export interface AdminSeller {
  _id: string;
  businessName: string;
  email: string;
  contactPerson: string;
  phone?: string;
  address?: string;
  businessType?: string;
  gstNumber?: string;
  status: SellerStatus;
  verified: boolean;
  commission?: number;
  totalProducts?: number;
  totalSales?: number;
  revenue?: number;
  rating?: number;
  lastLogin?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Re-export for convenience
export type { SellerStatus };

// API Response Types
export interface SellersResponse {
  sellers: AdminSeller[];
}

export interface SellerResponse {
  seller: AdminSeller;
}

// Service Types
export interface SellerUpdateStatusRequest {
  sellerId: string;
  status: SellerStatus;
}

export interface SellerUpdateVerifiedRequest {
  sellerId: string;
  verified: boolean;
}

// Admin Seller Types
export interface AdminSellersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: SellerStatus | 'all';
  verified?: boolean;
  period?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminSellerUpdate {
  status?: SellerStatus;
  verified?: boolean;
  commission?: number;
  notes?: string;
}

export interface AdminSellerBulkUpdate {
  sellerIds: string[];
  updates: {
    status?: SellerStatus;
    verified?: boolean;
    commission?: number;
  };
}

export interface AdminSellerStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  verified: number;
  unverified: number;
  totalRevenue: number;
  averageCommission: number;
}

// Component Props Types
export interface SellerCardProps {
  seller: AdminSeller;
  onStatusChange: (sellerId: string, status: SellerStatus) => void;
  onVerifiedToggle: (sellerId: string, verified: boolean) => void;
}

export interface SellerStatsProps {
  sellers: AdminSeller[];
}

export interface SellerFiltersProps {
  search: string;
  status: string;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
}

// Store Types
export interface SellerUIState {
  expandedSeller: string | null;
  selectedSellers: string[];
  setExpandedSeller: (sellerId: string | null) => void;
  setSelectedSellers: (sellerIds: string[]) => void;
  toggleSellerSelection: (sellerId: string) => void;
  clearSelection: () => void;
}