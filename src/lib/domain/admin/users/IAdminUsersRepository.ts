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
  inactive: number;
  suspended: number;
  banned: number;
  verified: number;
  unverified: number;
  newUsers: number;
  returningUsers: number;
  totalOrders: number;
  totalSpent: number;
  avgOrdersPerUser: number;
  avgSpentPerUser: number;
  byRegistrationSource: Array<{
    source: string;
    count: number;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    status: UserStatus;
    createdAt: Date;
  }>;
}

export interface IAdminUsersRepository {
  // Essential user queries
  findById(id: string): Promise<AdminUser | null>;
  findMany(query: AdminUsersQueryRequest): Promise<PaginationResult<AdminUser>>;
  getStats(period: string): Promise<UserStats>;
  
  // Essential user management
  updateStatus(userId: string, status: UserStatus, reason?: string): Promise<AdminUser>;
  addNote(userId: string, note: string): Promise<AdminUser>;
  
  // Essential user activity
  getOrderHistory(userId: string, limit?: number): Promise<any[]>;
}