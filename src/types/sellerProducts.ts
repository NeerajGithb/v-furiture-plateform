import { ApiResponse, TimePeriod } from './common';

// Product Status Types
export type SellerProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNPUBLISHED';

// Product Image Types
export interface ProductImage {
  url: string;
  alt?: string;
  publicId: string;
}

// Product Review Types
export interface ProductReviews {
  average: number;
  count: number;
}

// Seller Product Types
export interface SellerProduct {
  _id: string;
  name: string;
  description?: string;
  categoryId: string;
  subCategoryId: string;
  itemId: string;
  sku?: string;
  originalPrice: number;
  finalPrice: number;
  discountPercent?: number;
  inStockQuantity?: number;
  mainImage?: ProductImage;
  galleryImages: ProductImage[];
  isPublished?: boolean;
  status: SellerProductStatus;
  rejectionReason?: string;
  totalSold?: number;
  viewCount?: number;
  wishlistCount?: number;
  totalCart?: number;
  ratings?: number;
  reviews?: ProductReviews;
  createdAt: string;
  updatedAt: string;
}

// Product Stats Types
export interface SellerProductStats {
  total: number;
  published: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  lowStock: number;
  outOfStock: number;
}

// Product Form Data Types
export interface ProductFormData {
  name: string;
  description?: string;
  categoryId: string;
  subCategoryId: string;
  originalPrice: number;
  finalPrice: number;
  discountPercent?: number;
  inStockQuantity?: number;
  mainImage?: ProductImage;
  galleryImages: ProductImage[];
  isPublished?: boolean;
}

// Product Update Data Types
export interface ProductUpdateData extends Partial<ProductFormData> {
  rejectionReason?: string;
  status?: SellerProductStatus;
}

// Product Bulk Update Types
export interface ProductBulkUpdateData {
  productIds: string[];
  updates: {
    status?: SellerProductStatus;
    isPublished?: boolean;
    categoryId?: string;
    discountPercent?: number;
  };
}

// API Response Types
export interface ProductsResponse {
  products: SellerProduct[];
  stats?: SellerProductStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SingleProductResponse extends ApiResponse {
  data: {
    product: SellerProduct;
  };
}

export interface ProductStatsResponse extends ApiResponse {
  data: {
    stats: SellerProductStats;
  };
}

// Filter Types
export interface ProductFilters {
  status?: SellerProductStatus | 'all';
  category?: string;
  subCategory?: string;
  stock?: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
  search?: string;
  period?: TimePeriod;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsQuery {
  status?: SellerProductStatus | 'all';
  category?: string;
  subCategory?: string;
  stock?: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
  search?: string;
  period?: TimePeriod;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  categoryId: string;
  subCategoryId: string;
  originalPrice: number;
  finalPrice: number;
  discountPercent?: number;
  inStockQuantity?: number;
  mainImage?: ProductImage;
  galleryImages: ProductImage[];
  isPublished?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  subCategoryId?: string;
  originalPrice?: number;
  finalPrice?: number;
  discountPercent?: number;
  inStockQuantity?: number;
  mainImage?: ProductImage;
  galleryImages?: ProductImage[];
  isPublished?: boolean;
}

export interface BulkUpdateRequest {
  productIds: string[];
  updates: {
    status?: SellerProductStatus;
    isPublished?: boolean;
    categoryId?: string;
    discountPercent?: number;
  };
}

export interface ProductStats {
  total: number;
  published: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  lowStock: number;
  outOfStock: number;
}

export interface ExportOptions {
  format?: 'csv' | 'xlsx' | 'pdf';
  period?: string;
  startDate?: string;
  endDate?: string;
  status?: SellerProductStatus;
}

// Service Parameters
export interface ProductServiceParams extends ProductFilters {
  includeStats?: boolean;
}

// UI State Types
export interface SellerProductUIState {
  selectedProducts: string[];
  activeTab: string;
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  showBulkModal: boolean;
  editingProduct: SellerProduct | null;
  selectedFilters: {
    status: string;
    category: string;
    stock: string;
  };
  
  // UI Actions
  setSelectedProducts: (productIds: string[]) => void;
  toggleProductSelection: (productId: string) => void;
  selectAllProducts: (productIds: string[]) => void;
  clearSelection: () => void;
  setActiveTab: (tab: string) => void;
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  setShowBulkModal: (show: boolean) => void;
  setEditingProduct: (product: SellerProduct | null) => void;
  setSelectedFilters: (filters: Partial<SellerProductUIState['selectedFilters']>) => void;
  reset: () => void;
}

// Component Props Types
export interface ProductsHeaderProps {
  seller?: any;
  stats: SellerProductStats;
}

export interface ProductsFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export interface ProductsGridProps {
  products: SellerProduct[];
  allProducts: SellerProduct[];
  expandedProduct: string | null;
  setExpandedProduct: (productId: string | null) => void;
}

export interface ProductDetailHeaderProps {
  product: SellerProduct;
  productId: string;
}

export interface ProductImageGalleryProps {
  product: SellerProduct;
}

export interface ProductAnalyticsProps {
  product: SellerProduct;
}

export interface ProductInformationProps {
  product: SellerProduct;
}

export interface ProductCardProps {
  product: SellerProduct;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (product: SellerProduct) => void;
  onDelete: (productId: string) => void;
  onToggleStatus: (productId: string, isPublished: boolean) => void;
}

// Form Validation Types
export interface ProductFormErrors {
  name?: string;
  description?: string;
  categoryId?: string;
  subCategoryId?: string;
  originalPrice?: string;
  finalPrice?: string;
  inStockQuantity?: string;
  mainImage?: string;
}

// Export Types
export interface ProductExportParams {
  filters?: ProductFilters;
  format?: 'csv' | 'xlsx' | 'pdf';
  fields?: string[];
}