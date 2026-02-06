// Common Types used across the platform

// Time Period for filters and analytics
export type TimePeriod = '30min' | '1hour' | '1day' | '7days' | '30days' | '1year' | 'all';

// Sort Order
export type SortOrder = 'asc' | 'desc';

// Status Types
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type SellerStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type ProductPublishStatus = 'published' | 'draft' | 'archived';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

// Filter Parameters
export interface FilterParams {
  period?: TimePeriod;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

// API Response Base
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Paginated API Response
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T> {
  pagination?: PaginationParams;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

// Date Range
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Currency
export type Currency = 'INR' | 'USD' | 'EUR';

// File Upload
export interface FileUpload {
  file: File;
  url?: string;
  progress?: number;
  error?: string;
}

// Image
export interface ImageData {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

// Address
export interface Address {
  id?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

// Notification
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Search Result
export interface SearchResult<T = unknown> {
  items: T[];
  total: number;
  query: string;
  filters?: Record<string, unknown>;
  suggestions?: string[];
}