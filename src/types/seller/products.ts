import type { BulkUpdateData, SellerProduct, ProductStats } from '@/lib/domain/seller/products/ISellerProductsRepository';

export type {
  SellerProduct,
  ProductFilters,
  ProductStats,
  CreateProductData,
  UpdateProductData,
  BulkUpdateData,
  SellerProductsResult,
  BulkUpdateResult,
  ProductExportResult,
} from '@/lib/domain/seller/products/ISellerProductsRepository';

export type {
  SellerProductsQueryRequest,
  CreateProductRequest,
  UpdateProductRequest,
  BulkProductUpdateRequest,
  ProductExportRequest,
} from '@/lib/domain/seller/products/SellerProductsSchemas';

export type SellerProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNPUBLISHED';

export type BulkUpdateRequest = BulkUpdateData;

export interface ProductsQuery {
  status?: SellerProductStatus | 'all';
  search?: string;
  period?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExportOptions {
  format?: 'csv' | 'xlsx' | 'pdf';
  period?: string;
  startDate?: string;
  endDate?: string;
  status?: SellerProductStatus;
}

export interface ProductsFiltersProps {
  statusFilter: string;
  onStatusFilter: (status: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export interface ProductsGridProps {
  products: SellerProduct[];
  expandedProduct: string | null;
  onExpandProduct: (productId: string | null) => void;
  onUpdateStatus: (productId: string, isPublished: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
  isUpdating: boolean;
}

export interface ProductsHeaderProps {
  stats: ProductStats;
  onExport: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}
