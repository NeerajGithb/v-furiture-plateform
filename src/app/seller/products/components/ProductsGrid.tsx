import { useState } from 'react';
import { MoreVertical, Eye, Edit, Copy, Trash2, Package, DollarSign } from 'lucide-react';
import { useNavigate } from '@/components/NavigationLoader';
import { SellerProduct } from '@/types/sellerProducts';

interface ProductsGridProps {
  products: SellerProduct[];
  expandedProduct: string | null;
  onExpandProduct: (productId: string | null) => void;
  onUpdateStatus: (productId: string, isPublished: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
  isUpdating: boolean;
}

export function ProductsGrid({
  products,
  expandedProduct,
  onExpandProduct,
  onUpdateStatus,
  onDeleteProduct,
  onDuplicateProduct,
  isUpdating
}: ProductsGridProps) {
  const router = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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

  const handleDeleteConfirm = (productId: string) => {
    onDeleteProduct(productId);
    setShowDeleteConfirm(null);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500 mb-4">Get started by creating your first product</p>
        <button
          onClick={() => router.push('/seller/products/new')}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Add Product
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 relative">
            {product.mainImage?.url ? (
              <img
                src={product.mainImage.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status || 'draft')}`}>
                {product.status || 'draft'}
              </span>
            </div>

            {/* Actions Menu */}
            <div className="absolute top-2 right-2">
              <div className="relative">
                <button
                  onClick={() => onExpandProduct(expandedProduct === product._id ? null : product._id)}
                  className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>

                {expandedProduct === product._id && (
                  <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-40">
                    <button
                      onClick={() => router.push(`/seller/products/${product._id}`)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/seller/products/new?id=${product._id}`)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDuplicateProduct(product._id)}
                      disabled={isUpdating}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => onUpdateStatus(product._id, !product.isPublished)}
                      disabled={isUpdating}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {product.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(product._id)}
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

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-900">${product.finalPrice}</span>
                {product.originalPrice !== product.finalPrice && (
                  <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Stock: {product.inStockQuantity || 0}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                disabled={isUpdating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}