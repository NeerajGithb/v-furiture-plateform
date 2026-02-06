'use client';

import {
  RefreshCw, Download
} from 'lucide-react';
import {
  useAdminProducts,
  useAdminProductStats,
  useUpdateAdminProduct,
  useDeleteAdminProduct,
  useBulkUpdateAdminProducts,
  useExportAdminProducts
} from '../../../hooks/admin/useAdminProducts';
import { AdminProductStats } from '@/types/adminProduct';
import ProductsOverview from './components/ProductsOverview';
import ProductsTable from './components/ProductsTable';
import ProductsSkeleton from './components/ProductsSkeleton';

export default function AdminProductsPage() {
  // Data hooks
  const { data: productsData, isLoading, refetch } = useAdminProducts();
  const { data: stats } = useAdminProductStats();
  const { mutate: updateProduct } = useUpdateAdminProduct();
  const { mutate: deleteProduct } = useDeleteAdminProduct();
  const { mutate: bulkUpdate } = useBulkUpdateAdminProducts();
  const { mutate: exportProducts, isPending: exportPending } = useExportAdminProducts();

  const allProducts = productsData?.products || [];

  const handleApprove = (productId: string) => {
    updateProduct({ productId, data: { status: 'approved' } });
  };

  const handleReject = (productId: string, reason: string) => {
    updateProduct({ productId, data: { status: 'rejected', rejectionReason: reason } });
  };

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  };

  const handleBulkApprove = (productIds: string[]) => {
    bulkUpdate({ productIds, status: 'approved' });
  };

  const handleBulkReject = (productIds: string[], reason: string) => {
    bulkUpdate({ productIds, status: 'rejected', rejectionReason: reason });
  };

  const handleBulkDelete = (productIds: string[]) => {
    if (confirm(`Are you sure you want to delete ${productIds.length} products?`)) {
      // Note: This would need a separate bulk delete mutation
      productIds.forEach(id => deleteProduct(id));
    }
  };

  const handleExport = () => {
    exportProducts({});
  };

  return (
    <>
      {isLoading ? (
        <ProductsSkeleton />
      ) : productsData ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and approve seller products</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium text-gray-700"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                disabled={exportPending}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium text-gray-700"
              >
                <Download className="w-4 h-4" />
                {exportPending ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          {stats ? (
            <ProductsOverview 
              stats={stats as AdminProductStats} 
              onNavigate={() => {}} 
            />
          ) : null}

          {/* Products Table */}
          <ProductsTable
            products={allProducts}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            onBulkApprove={handleBulkApprove}
            onBulkReject={handleBulkReject}
            onBulkDelete={handleBulkDelete}
            selectedProducts={[]}
            onSelectProduct={() => {}}
            onSelectAll={() => {}}
          />
        </div>
      ) : null}
    </>
  );
}
