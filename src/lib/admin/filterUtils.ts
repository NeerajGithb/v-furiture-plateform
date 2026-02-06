import { TimePeriod, FilterParams, ApiResponse } from '@/types';

export interface TimeFilter {
  createdAt?: { $gte: Date };
}

/**
 * Convert time period to MongoDB filter
 */
export function getTimeFilterFromPeriod(period: TimePeriod = 'all'): TimeFilter {
  if (period === 'all') {
    return {};
  }

  const now = new Date();
  let startDate: Date;

  switch (period) {
    case '30min':
      startDate = new Date(now.getTime() - 30 * 60 * 1000);
      break;
    case '1hour':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '1day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '1year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      return {};
  }

  return {
    createdAt: { $gte: startDate }
  };
}

/**
 * Parse query parameters into filter params
 */
export function parseFilterParams(searchParams: URLSearchParams): FilterParams {
  return {
    period: (searchParams.get('period') as TimePeriod) || 'all',
    status: searchParams.get('status') || undefined,
    search: searchParams.get('search') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };
}

/**
 * Build MongoDB query from filter params
 */
export function buildMongoQuery(filters: FilterParams): any {
  const query: any = {};

  // Time filter
  const timeFilter = getTimeFilterFromPeriod(filters.period);
  Object.assign(query, timeFilter);

  // Status filter
  if (filters.status && filters.status !== 'all') {
    // Handle different status field names
    if (filters.status.includes('payment_')) {
      query.paymentStatus = filters.status.replace('payment_', '');
    } else if (filters.status.includes('order_')) {
      query.orderStatus = filters.status.replace('order_', '');
    } else {
      query.status = filters.status;
    }
  }

  // Search filter (will be handled per model)
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  return query;
}

/**
 * Build sort object from filter params
 */
export function buildSortObject(filters: FilterParams): any {
  const sortField = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
  return { [sortField]: sortOrder };
}

/**
 * Build pagination object from filter params
 */
export function buildPagination(filters: FilterParams): { skip: number; limit: number } {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, Math.max(1, filters.limit || 20));
  const skip = (page - 1) * limit;
  
  return { skip, limit };
}

/**
 * Standardized API response format - using centralized type
 */
export type { ApiResponse } from '@/types';

/**
 * Create standardized API response
 */
export function createApiResponse<T>(
  data: T,
  pagination?: { page: number; limit: number; total: number }
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (pagination) {
    response.pagination = {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    };
  }

  return response;
}

/**
 * Create error API response
 */
export function createErrorResponse(error: string): ApiResponse<null> {
  return {
    success: false,
    error,
  };
}