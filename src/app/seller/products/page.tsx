'use client';

import { useState } from 'react';
import {
  useSellerProducts,
  useSellerProductStats,
  useUpdateProductStatus,
  useDeleteProduct,
  useBulkUpdateProducts,
  useBulkDeleteProducts,
  useDuplicateProduct,
  useExportProducts
} from '@/hooks/seller/useSellerProducts';
import { ProductsQuery, SellerProductStatus } from '@/types/sellerProducts';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ProductsSkeleton } from './components/ProductsSkeleton';
import { ProductsHeader } from './components/ProductsHeader';
import { ProductsFilters } from './components/ProductsFilters';
import { ProductsGrid } from './components/ProductsGrid';
import { ProductsPagination } from './components/ProductsPagination';

export default function SellerProductsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  
  // Filters state
  const [filters, setFilters] = useState<ProductsQuery>({
    page: 1,
    limit: 20,
    status: 'all',
    search: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });

  // React Query hooks
  const { data: productsData, isLoading, error, refetch } = useSellerProducts(filters);
  const { data: stats } = useSellerProductStats();
  
  // Mutations
  const updateProductStatus = useUpdateProductStatus();
  const deleteProduct = useDeleteProduct();
  const bulkUpdateProducts = useBulkUpdateProducts();
  const bulkDeleteProducts = useBulkDeleteProducts();
  const duplicateProduct = useDuplicateProduct();
  const exportProducts = useExportProducts();

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;

  const handleExport = () => {
    exportProducts.mutate({
      status: filters.status === 'all' ? undefined : filters.status as SellerProductStatus,
      format: 'xlsx'
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ 
      ...prev, 
      status: status === 'all' ? 'all' : status as SellerProductStatus, 
      page: 1 
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const handleUpdateStatus = (productId: string, isPublished: boolean) => {
    updateProductStatus.mutate({ productId, isPublished });
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct.mutate(productId);
  };

  const handleDuplicateProduct = (productId: string) => {
    duplicateProduct.mutate(productId);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Products</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Unable to load products data. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Retrying...' : 'Retry'}
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && <ProductsSkeleton />}
      {!isLoading && (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
          <ProductsHeader 
            stats={stats || { total: 0, published: 0, draft: 0, pending: 0, approved: 0, rejected: 0, lowStock: 0, outOfStock: 0 }}
            onExport={handleExport}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />

          <ProductsFilters
            statusFilter={filters.status || 'all'}
            onStatusFilter={handleStatusFilter}
            searchQuery={filters.search || ''}
            onSearchChange={handleSearchChange}
            sortBy={filters.sortBy || 'updatedAt'}
            sortOrder={filters.sortOrder || 'desc'}
            onSortChange={handleSortChange}
          />

          <ProductsGrid
            products={products}
            expandedProduct={expandedProduct}
            onExpandProduct={setExpandedProduct}
            onUpdateStatus={handleUpdateStatus}
            onDeleteProduct={handleDeleteProduct}
            onDuplicateProduct={handleDuplicateProduct}
            isUpdating={updateProductStatus.isPending || deleteProduct.isPending || duplicateProduct.isPending}
          />

          {pagination && pagination.pages > 1 && (
            <ProductsPagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </>
  );
}