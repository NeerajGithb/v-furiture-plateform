export interface ProductFilters {
  sellerId: string;
  search?: string;
  status?: string;
  period?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductStats {
  total: number;
  published: number;
  draft: number;
  outOfStock: number;
  lowStock: number;
  pending: number;
  approved: number;
  rejected: number;
  totalViews: number;
  totalSold: number;
  totalWishlisted: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  categoryId: string;
  subCategoryId?: string;
  originalPrice: number;
  finalPrice: number;
  discountPercent?: number;
  inStockQuantity: number;
  mainImage: {
    url: string;
    publicId: string;
  };
  galleryImages?: Array<{
    url: string;
    publicId: string;
  }>;
  sku?: string;
  isPublished?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  categoryId?: string;
  subCategoryId?: string;
  originalPrice?: number;
  finalPrice?: number;
  discountPercent?: number;
  inStockQuantity?: number;
  mainImage?: {
    url: string;
    publicId: string;
  };
  galleryImages?: Array<{
    url: string;
    publicId: string;
  }>;
  isPublished?: boolean;
}

export interface BulkUpdateData {
  productIds: string[];
  updates: {
    isPublished?: boolean;
    status?: string;
    inStockQuantity?: number;
    finalPrice?: number;
  };
}

export interface SellerProduct {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  subCategoryId?: string;
  itemId: string;
  sku: string;
  originalPrice: number;
  finalPrice: number;
  discountPercent: number;
  inStockQuantity: number;
  mainImage: {
    url: string;
    publicId: string;
  };
  galleryImages: Array<{
    url: string;
    publicId: string;
  }>;
  isPublished: boolean;
  status: string;
  rejectionReason?: string;
  totalSold: number;
  viewCount: number;
  wishlistCount: number;
  totalCart: number;
  ratings: number;
  reviews: {
    averageRating: number;
    totalReviews: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerProductsResult {
  products: SellerProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BulkUpdateResult {
  modifiedCount: number;
  message: string;
}

export interface ProductExportResult {
  content: string;
  filename: string;
  contentType: string;
}

export interface ISellerProductsRepository {
  // Product queries
  findProducts(filters: ProductFilters): Promise<SellerProductsResult>;
  getProductStats(sellerId: string): Promise<ProductStats>;
  findById(productId: string, sellerId: string): Promise<SellerProduct>;
  
  // Product management
  create(sellerId: string, data: CreateProductData): Promise<SellerProduct>;
  update(productId: string, sellerId: string, data: UpdateProductData): Promise<SellerProduct>;
  delete(productId: string, sellerId: string): Promise<void>;
  updateProductStatus(productId: string, sellerId: string, isPublished: boolean): Promise<SellerProduct>;
  
  // Bulk operations
  bulkUpdate(sellerId: string, data: BulkUpdateData): Promise<BulkUpdateResult>;
  
  // Export
  getProductsForExport(sellerId: string, search?: string, status?: string): Promise<SellerProduct[]>;
}