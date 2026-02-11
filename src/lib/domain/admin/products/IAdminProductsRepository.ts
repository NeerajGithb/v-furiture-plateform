import { AdminProductsQueryRequest, ProductStatus } from "./AdminProductsSchemas";
import { PaginationResult } from "../../shared/types";

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  status: ProductStatus;
  isPublished: boolean;
  sellerId: {
    id: string;
    businessName: string;
    email: string;
    phone?: string;
  };
  categoryId: {
    id: string;
    name: string;
  };
  subCategoryId?: {
    id: string;
    name: string;
  };
  stock: number;
  sku: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional fields from Product model
  brand?: string;
  material?: string;
  discountPercent?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  weight?: number;
  colorOptions?: string[];
  colors?: string[]; // Alias for colorOptions
  warranty?: string;
  tags?: string[];
  isFeatured?: boolean;
  viewCount?: number;
  wishlistCount?: number;
  totalSold?: number;
  reviews?: {
    average: number;
    count: number;
  };
  averageRating?: number; // Alias for reviews.average
  reviewCount?: number; // Alias for reviews.count
}

export interface ProductStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  published: number;
  unpublished: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
  bySeller: Array<{
    sellerId: string;
    sellerName: string;
    count: number;
  }>;
  recentActivity: Array<{
    productId: string;
    productName: string;
    action: string;
    timestamp: Date;
  }>;
}

export interface BulkOperationResult {
  success: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
  total: number;
  successCount: number;
  failedCount: number;
}

export interface IAdminProductsRepository {
  // Product queries
  findById(id: string): Promise<AdminProduct | null>;
  findMany(query: AdminProductsQueryRequest): Promise<PaginationResult<AdminProduct>>;
  getStats(period: string): Promise<ProductStats>;
  
  // Product management
  updateStatus(productId: string, status: ProductStatus, reason?: string): Promise<AdminProduct>;
  updatePublishStatus(productId: string, isPublished: boolean): Promise<AdminProduct>;
  delete(productId: string): Promise<void>;
  
  // Bulk operations
  bulkUpdateStatus(productIds: string[], status: ProductStatus, reason?: string): Promise<BulkOperationResult>;
  bulkUpdatePublishStatus(productIds: string[], isPublished: boolean): Promise<BulkOperationResult>;
  bulkDelete(productIds: string[]): Promise<BulkOperationResult>;
  
  // Analytics
  getProductTrends(startDate: Date, endDate: Date): Promise<Array<{
    date: string;
    total: number;
    approved: number;
    rejected: number;
    pending: number;
  }>>;
}