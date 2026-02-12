'use client';

import {
  useSellerProducts,
  useSellerProductStats,
  useUpdateProductStatus,
  useDeleteProduct,
  useDuplicateProduct,
  useBulkUpdateProducts,
  useBulkDeleteProducts,
} from '@/hooks/seller/useSellerProducts';
import { useSellerProductsStore } from '@/stores/seller/sellerProductsStore';
import { useConfirm } from '@/contexts/ConfirmContext';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { Pagination } from '@/components/ui/Pagination';
import PageHeader from '@/components/PageHeader';
import { ProductsStats } from './components/ProductsStats';
import { ProductsGrid } from './components/ProductsGrid';
import { CheckSquare, Trash2 } from 'lucide-react';

export default function SellerProductsPage() {
  const expandedProduct = useSellerProductsStore(s => s.expandedProduct);
  const setExpandedProduct = useSellerProductsStore(s => s.setExpandedProduct);
  const currentPage = useSellerProductsStore(s => s.currentPage);
  const setCurrentPage = useSellerProductsStore(s => s.setCurrentPage);
  const selectedProducts = useSellerProductsStore(s => s.selectedProducts);
  const setSelectedProducts = useSellerProductsStore(s => s.setSelectedProducts);
  const toggleProductSelection = useSellerProductsStore(s => s.toggleProductSelection);
  const clearSelection = useSellerProductsStore(s => s.clearSelection);

  const { data: productsData, isPending, error, refetch, isFetching } = useSellerProducts();
  const { data: stats, isPending: statsPending } = useSellerProductStats();

  const updateProductStatus = useUpdateProductStatus();
  const deleteProduct = useDeleteProduct();
  const duplicateProduct = useDuplicateProduct();
  const bulkUpdate = useBulkUpdateProducts();
  const bulkDelete = useBulkDeleteProducts();

  const { confirm } = useConfirm();

  const handleUpdateStatus = (productId: string, isPublished: boolean) => {
    updateProductStatus.mutate({ productId, isPublished });
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct.mutate(productId);
  };

  const handleDuplicateProduct = (productId: string) => {
    duplicateProduct.mutate(productId);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && productsData?.data) {
      setSelectedProducts(productsData.data.map(p => p.id));
    } else {
      clearSelection();
    }
  };

  const selectedProductsData = productsData?.data.filter(p => selectedProducts.includes(p.id)) || [];
  const allSelectedPublished = selectedProductsData.length > 0 && selectedProductsData.every(p => p.isPublished);
  const allSelectedUnpublished = selectedProductsData.length > 0 && selectedProductsData.every(p => !p.isPublished);
  const hasPublished = selectedProductsData.some(p => p.isPublished);
  const hasUnpublished = selectedProductsData.some(p => !p.isPublished);

  const handleBulkPublish = () => {
    const unpublishedIds = selectedProductsData.filter(p => !p.isPublished).map(p => p.id);
    if (unpublishedIds.length === 0) return;

    confirm({
      title: 'Publish Products',
      message: `Publish ${unpublishedIds.length} selected product(s)?`,
      type: 'confirm',
      confirmText: 'Publish',
      cancelText: 'Cancel',
      onConfirm: () => {
        bulkUpdate.mutate(
          { productIds: unpublishedIds, updates: { isPublished: true } },
          { onSuccess: () => clearSelection() }
        );
      }
    });
  };

  const handleBulkUnpublish = () => {
    const publishedIds = selectedProductsData.filter(p => p.isPublished).map(p => p.id);
    if (publishedIds.length === 0) return;

    confirm({
      title: 'Unpublish Products',
      message: `Unpublish ${publishedIds.length} selected product(s)?`,
      type: 'confirm',
      confirmText: 'Unpublish',
      cancelText: 'Cancel',
      onConfirm: () => {
        bulkUpdate.mutate(
          { productIds: publishedIds, updates: { isPublished: false } },
          { onSuccess: () => clearSelection() }
        );
      }
    });
  };

  const handleBulkDelete = () => {
    confirm({
      title: 'Delete Products',
      message: `Delete ${selectedProducts.length} selected product(s)? This action cannot be undone.`,
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        bulkDelete.mutate(selectedProducts, { onSuccess: () => clearSelection() });
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your product inventory and listings"
        onRefresh={refetch}
        isRefreshing={isFetching}
        actions={
          selectedProducts.length > 0 ? (
            <div className="flex gap-3">
              {hasUnpublished && (
                <button
                  key="publish"
                  onClick={handleBulkPublish}
                  disabled={bulkUpdate.isPending}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  Publish ({selectedProductsData.filter(p => !p.isPublished).length})
                </button>
              )}
              {hasPublished && (
                <button
                  key="unpublish"
                  onClick={handleBulkUnpublish}
                  disabled={bulkUpdate.isPending}
                  className="px-4 py-2 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  Unpublish ({selectedProductsData.filter(p => p.isPublished).length})
                </button>
              )}
              <button
                key="delete"
                onClick={handleBulkDelete}
                disabled={bulkDelete.isPending}
                className="px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedProducts.length})
              </button>
            </div>
          ) : undefined
        }
      />

      <LoaderGuard
        isLoading={isPending}
        error={error}
        isEmpty={!productsData || (productsData.pagination?.total || 0) === 0}
        emptyMessage="No products"
      >
        {() => (
          <>
            {stats && !statsPending && (
              <ProductsStats stats={stats} />
            )}

            <ProductsGrid
              products={productsData!.data}
              expandedProduct={expandedProduct}
              selectedProducts={selectedProducts}
              onExpandProduct={setExpandedProduct}
              onToggleSelection={toggleProductSelection}
              onSelectAll={handleSelectAll}
              onUpdateStatus={handleUpdateStatus}
              onDeleteProduct={handleDeleteProduct}
              onDuplicateProduct={handleDuplicateProduct}
              isUpdating={updateProductStatus.isPending || deleteProduct.isPending || duplicateProduct.isPending}
            />

            {productsData!.pagination && productsData!.pagination.totalPages > 1 && (
              <Pagination
                pagination={{
                  ...productsData!.pagination,
                  hasNext: productsData!.pagination.page < productsData!.pagination.totalPages,
                  hasPrev: productsData!.pagination.page > 1,
                }}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </LoaderGuard>
    </>
  );
}
