import { MoreVertical, Eye, Edit, Copy, Trash2, Package } from 'lucide-react';
import { useNavigate } from '@/components/NavigationLoader';
import { useConfirm } from '@/contexts/ConfirmContext';
import { formatCurrency } from '@/utils/currency';
import { SellerProduct } from '@/types/seller/products';

interface ProductsGridProps {
  products: SellerProduct[];
  expandedProduct: string | null;
  selectedProducts: string[];
  onExpandProduct: (productId: string | null) => void;
  onToggleSelection: (productId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateStatus: (productId: string, isPublished: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
  isUpdating: boolean;
}

export function ProductsGrid({
  products,
  expandedProduct,
  selectedProducts,
  onExpandProduct,
  onToggleSelection,
  onSelectAll,
  onUpdateStatus,
  onDeleteProduct,
  onDuplicateProduct,
  isUpdating
}: ProductsGridProps) {
  const router = useNavigate();
  const { confirm } = useConfirm();

  const allSelected = products.length > 0 && selectedProducts.length === products.length;
  const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length;

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

  const handleDeleteClick = (productId: string, productName: string) => {
    confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        onDeleteProduct(productId);
      }
    });
  };

  return (
    <>
      {selectedProducts.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-blue-900 font-medium">
            {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => onSelectAll(false)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear selection
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-100 relative">
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleSelection(product.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
                />
              </div>
              
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
              
              <div className="absolute top-2 left-12">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status || 'draft')}`}>
                  {product.status || 'draft'}
                </span>
              </div>

              <div className="absolute top-2 right-2">
                <div className="relative">
                  <button
                    onClick={() => onExpandProduct(expandedProduct === product.id ? null : product.id)}
                    className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>

                  {expandedProduct === product.id && (
                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-40">
                      <button
                        onClick={() => router.push(`/seller/products/${product.id}`)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => router.push(`/seller/products/new?id=${product.id}`)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDuplicateProduct(product.id)}
                        disabled={isUpdating}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => onUpdateStatus(product.id, !product.isPublished)}
                        disabled={isUpdating}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {product.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product.id, product.name)}
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

            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{formatCurrency(product.finalPrice)}</span>
                  {product.originalPrice !== product.finalPrice && (
                    <span className="text-sm text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Stock: {product.inStockQuantity || 0}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
