'use client';

import { Download } from 'lucide-react';
import {
  useAdminProducts,
  useAdminProductStats,
  useUpdateAdminProduct,
  useDeleteAdminProduct,
  useExportAdminProducts,
  useBulkUpdateAdminProducts,
  useBulkPublishProducts,
  useBulkDeleteProducts
} from '@/hooks/admin/useAdminProducts';
import { useProductUIStore } from '@/stores/admin/productStore';
import { useConfirm } from '@/contexts/ConfirmContext';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { Pagination } from '@/components/ui/Pagination';
import PageHeader from '@/components/PageHeader';
import ProductsOverview from './components/ProductsOverview';
import ProductsTable from './components/ProductsTable';
import BulkActionsHeader from './components/BulkActionsHeader';

export default function AdminProductsPage() {
  const currentPage = useProductUIStore(s => s.currentPage);
  const setCurrentPage = useProductUIStore(s => s.setCurrentPage);
  const selectedProducts = useProductUIStore(s => s.selectedProducts);
  const clearSelection = useProductUIStore(s => s.clearSelection);

  const { data: productsData, isPending, error: productsError, refetch, isFetching } = useAdminProducts();
  const { data: stats, isPending: statsPending } = useAdminProductStats();
  
  const updateProduct = useUpdateAdminProduct();
  const deleteProduct = useDeleteAdminProduct();
  const exportProducts = useExportAdminProducts();
  const bulkUpdate = useBulkUpdateAdminProducts();
  const bulkPublish = useBulkPublishProducts();
  const bulkDelete = useBulkDeleteProducts();
  const { confirm } = useConfirm();

  const handleApprove = (productId: string) => {
    updateProduct.mutate({ productId, data: { status: 'APPROVED' } });
  };

  const handleReject = (productId: string, reason: string) => {
    updateProduct.mutate({ productId, data: { status: 'REJECTED', rejectionReason: reason } });
  };

  const handleDelete = (productId: string) => {
    confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteProduct.mutate(productId);
      }
    });
  };

  const handleBulkApprove = () => {
    const productsToApprove = productsData!.data.filter(p => 
      selectedProducts.includes(p.id) && p.status !== 'APPROVED'
    );
    
    confirm({
      title: 'Approve Products',
      message: `Are you sure you want to approve ${productsToApprove.length} product(s)?`,
      type: 'confirm',
      onConfirm: () => {
        bulkUpdate.mutate({
          action: 'approve',
          productIds: productsToApprove.map(p => p.id),
          status: 'APPROVED'
        });
        clearSelection();
      }
    });
  };

  const handleBulkReject = () => {
    const productsToReject = productsData!.data.filter(p => 
      selectedProducts.includes(p.id) && p.status !== 'REJECTED'
    );
    
    confirm({
      title: 'Reject Products',
      message: `Are you sure you want to reject ${productsToReject.length} product(s)?`,
      type: 'delete',
      onConfirm: () => {
        bulkUpdate.mutate({
          action: 'reject',
          productIds: productsToReject.map(p => p.id),
          status: 'REJECTED',
          reason: 'Bulk rejection'
        });
        clearSelection();
      }
    });
  };

  const handleBulkSetPending = () => {
    const productsToSetPending = productsData!.data.filter(p => 
      selectedProducts.includes(p.id) && p.status !== 'PENDING'
    );
    
    confirm({
      title: 'Set Products to Pending',
      message: `Are you sure you want to set ${productsToSetPending.length} product(s) to pending?`,
      type: 'confirm',
      onConfirm: () => {
        bulkUpdate.mutate({
          action: 'updateStatus',
          productIds: productsToSetPending.map(p => p.id),
          status: 'PENDING'
        });
        clearSelection();
      }
    });
  };

  const handleBulkPublish = () => {
    const productsToPublish = productsData!.data.filter(p => 
      selectedProducts.includes(p.id) && !p.isPublished
    );
    
    bulkPublish.mutate({ productIds: productsToPublish.map(p => p.id), isPublished: true });
    clearSelection();
  };

  const handleBulkUnpublish = () => {
    const productsToUnpublish = productsData!.data.filter(p => 
      selectedProducts.includes(p.id) && p.isPublished
    );
    
    bulkPublish.mutate({ productIds: productsToUnpublish.map(p => p.id), isPublished: false });
    clearSelection();
  };

  const handleBulkDelete = () => {
    confirm({
      title: 'Delete Products',
      message: `Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`,
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        bulkDelete.mutate(selectedProducts);
        clearSelection();
      }
    });
  };

  const handleExport = () => {
    exportProducts.mutate({});
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage and moderate seller products"
        onRefresh={refetch}
        isRefreshing={isFetching}
        actions={
          <button
            onClick={handleExport}
            disabled={exportProducts.isPending}
            className="flex items-center gap-2 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            {exportProducts.isPending ? 'Exporting...' : 'Export'}
          </button>
        }
      />

      <LoaderGuard 
        isLoading={isPending} 
        error={productsError}
        isEmpty={!productsData || (productsData.pagination?.total || 0) === 0}
        emptyMessage="No products"
      >
        {() => {
          const selectedProductsData = productsData!.data.filter(p => selectedProducts.includes(p.id));
          const canApprove = selectedProductsData.filter(p => p.status !== 'APPROVED').length;
          const canReject = selectedProductsData.filter(p => p.status !== 'REJECTED').length;
          const canSetPending = selectedProductsData.filter(p => p.status !== 'PENDING').length;
          const canPublish = selectedProductsData.filter(p => !p.isPublished).length;
          const canUnpublish = selectedProductsData.filter(p => p.isPublished).length;

          return (
            <>
              <ProductsOverview 
                stats={stats} 
                isLoading={statsPending}
                onNavigate={() => {}} 
              />

              {selectedProducts.length > 0 && (
                <BulkActionsHeader
                  selectedCount={selectedProducts.length}
                  canApprove={canApprove}
                  canReject={canReject}
                  canSetPending={canSetPending}
                  canPublish={canPublish}
                  canUnpublish={canUnpublish}
                  onClearSelection={clearSelection}
                  onBulkApprove={handleBulkApprove}
                  onBulkReject={handleBulkReject}
                  onBulkSetPending={handleBulkSetPending}
                  onBulkPublish={handleBulkPublish}
                  onBulkUnpublish={handleBulkUnpublish}
                  onBulkDelete={handleBulkDelete}
                />
              )}

              <ProductsTable
                products={productsData!.data}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                onExport={handleExport}
                isExporting={exportProducts.isPending}
                isUpdating={updateProduct.isPending}
              />

              <Pagination
                pagination={productsData!.pagination}
                onPageChange={setCurrentPage}
              />
            </>
          );
        }}
      </LoaderGuard>
    </>
  );
}