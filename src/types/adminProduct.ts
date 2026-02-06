// Admin Product Types
import { Product } from './product';

// Admin Product extends Product
export interface AdminProduct extends Product {
  // All fields from Product
}

// Admin Product stats interface
export interface AdminProductStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  unpublished: number;
  published: number;
  draft: number;
  lowStock: number;
  outOfStock: number;
  inStock: number;
  featured: number;
  newArrivals: number;
  totalViews: number;
  totalSold: number;
  totalWishlisted: number;
  totalCart: number;
}

// Product stats interface (legacy)
export interface ProductStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  unpublished: number;
  published: number;
  draft: number;
  lowStock: number;
  outOfStock: number;
  inStock: number;
  featured: number;
  newArrivals: number;
  totalViews: number;
  totalSold: number;
  totalWishlisted: number;
  totalCart: number;
}

// Products response interface
export interface ProductsResponse {
  products: AdminProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Admin Product Query Types
export interface AdminProductsQuery {
  search?: string;
  status?: string;
  category?: string;
  seller?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Admin Product Update Types
export interface AdminProductUpdate {
  status?: string;
  featured?: boolean;
  rejectionReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
}

// Admin Product Bulk Update Types
export interface AdminProductBulkUpdate {
  productIds: string[];
  status?: string;
  featured?: boolean;
  rejectionReason?: string;
  moderatedBy?: string;
}