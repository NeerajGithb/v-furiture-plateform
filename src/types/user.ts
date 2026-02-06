// User Types
import { UserStatus } from './common';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  verified?: boolean;
  status?: UserStatus;
  lastLoginAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Re-export for convenience
export type { UserStatus };

// API Response Types
export interface UsersResponse {
  users: AdminUser[];
}

export interface UserResponse {
  user: AdminUser;
}

// Service Types
export interface UserUpdateStatusRequest {
  userId: string;
  status: UserStatus;
}

// Component Props Types
export interface UserCardProps {
  user: AdminUser;
  onStatusChange: (userId: string, status: UserStatus) => void;
  onDelete: (userId: string) => void;
}

export interface UserStatsProps {
  users: AdminUser[];
}

export interface UserFiltersProps {
  search: string;
  status: string;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
}

// Store Types
export interface UserUIState {
  selectedUsers: string[];
  expandedUser: string | null;
  setSelectedUsers: (userIds: string[]) => void;
  toggleUserSelection: (userId: string) => void;
  clearSelection: () => void;
  setExpandedUser: (userId: string | null) => void;
}

// Admin User Query Types
export interface AdminUsersQuery {
  search?: string;
  status?: UserStatus;
  verified?: boolean;
  emailVerified?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Admin User Update Types
export interface AdminUserUpdate {
  status?: UserStatus;
  verified?: boolean;
  emailVerified?: boolean;
  notes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
}

// Admin User Bulk Update Types
export interface AdminUserBulkUpdate {
  userIds: string[];
  status?: UserStatus;
  verified?: boolean;
  emailVerified?: boolean;
  notes?: string;
  moderatedBy?: string;
}

// Admin User Stats Types
export interface AdminUserStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  emailVerifiedUsers: number;
  emailUnverifiedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userGrowth: number;
}