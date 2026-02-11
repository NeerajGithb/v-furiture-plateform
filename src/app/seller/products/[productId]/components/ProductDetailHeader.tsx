import { ArrowLeft, Edit, Copy, Trash2, Eye, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from '@/components/NavigationLoader';
import { useConfirm } from '@/contexts/ConfirmContext';
import { SellerProduct } from '@/types/seller/products';

interface ProductDetailHeaderProps {
  product: SellerProduct;
  productId: string;
  onUpdateStatus: (isPublished: boolean) => void;
  onDeleteProduct: () => void;
  onDuplicateProduct: () => void;
  isUpdating: boolean;
}

export function ProductDetailHeader({
  product,
  productId,
  onUpdateStatus,
  onDeleteProduct,
  onDuplicateProduct,
  isUpdating
}: ProductDetailHeaderProps) {
  const router = useNavigate();
  const { confirm } = useConfirm();
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = () => {
    confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        onDeleteProduct();
      }
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(product.status || 'draft')}`}>
                  {product.status || 'draft'}
                </span>
              </div>
              <p className="text-gray-600">Product ID: {productId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/seller/products/new?id=${productId}`)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>

            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-40">
                  <button
                    onClick={() => {
                      // Open product in new tab (client view)
                      window.open(`/products/${product.id}`, '_blank');
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Live
                  </button>
                  <button
                    onClick={() => {
                      onDuplicateProduct();
                      setShowActions(false);
                    }}
                    disabled={isUpdating}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      onUpdateStatus(!product.isPublished);
                      setShowActions(false);
                    }}
                    disabled={isUpdating}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {product.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-600">Price</p>
            <p className="text-lg font-bold text-gray-900">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
              }).format(product.finalPrice)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-600">Stock</p>
            <p className="text-lg font-bold text-gray-900">{product.inStockQuantity}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-600">Views</p>
            <p className="text-lg font-bold text-gray-900">-</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-600">Sales</p>
            <p className="text-lg font-bold text-gray-900">-</p>
          </div>
        </div>
      </div>
    </>
  );
}