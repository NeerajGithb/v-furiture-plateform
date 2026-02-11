import { AdminUsersQueryRequest, UserStatus } from "./AdminUsersSchemas";
import { PaginationResult } from "../../shared/types";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
  addresses: Array<{
    id: string;
    type: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  totalOrders: number;
  totalSpent: number;
  lastLogin?: Date;
  lastOrderDate?: Date;
  registrationSource: string;
  notes?: Array<{
    note: string;
    createdAt: Date;
    createdBy?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  verified: number;
}

export interface UsersWithStats {
  stats: UserStats;
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserDetails extends AdminUser {
  orders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: Date;
  }>;
}

export interface IAdminUsersRepository {
  findMany(query: AdminUsersQueryRequest): Promise<PaginationResult<AdminUser>>;
  findById(id: string): Promise<UserDetails | null>;
  getStats(period?: string): Promise<UserStats>;
}