import { DollarSign, Package, Calendar, Tag } from 'lucide-react';
import { SellerProduct } from '@/types/sellerProducts';

interface ProductInformationProps {
  product: SellerProduct;
}

export function ProductInformation({ product }: ProductInformationProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600">Description</label>
            <p className="text-gray-900 mt-1">{product.description || 'No description provided'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Category</label>
              <p className="text-gray-900 mt-1">{product.categoryId || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Subcategory</label>
              <p className="text-gray-900 mt-1">{product.subCategoryId || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Pricing
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Original Price</label>
              <p className="text-lg font-bold text-gray-900 mt-1">${product.originalPrice}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Final Price</label>
              <p className="text-lg font-bold text-green-600 mt-1">${product.finalPrice}</p>
            </div>
          </div>
          
          {product.discountPercent && product.discountPercent > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-600">Discount</label>
              <p className="text-red-600 font-semibold mt-1">{product.discountPercent}% OFF</p>
            </div>
          )}
        </div>
      </div>

      {/* Inventory */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Inventory
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Stock Quantity</label>
              <p className={`text-lg font-bold mt-1 ${
                (product.inStockQuantity || 0) > 10 
                  ? 'text-green-600' 
                  : (product.inStockQuantity || 0) > 0 
                  ? 'text-yellow-600' 
                  : 'text-red-600'
              }`}>
                {product.inStockQuantity || 0}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <p className={`text-sm font-medium mt-1 ${
                (product.inStockQuantity || 0) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(product.inStockQuantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Metadata
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Created</label>
              <p className="text-gray-900 mt-1">
                {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Not available'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Last Updated</label>
              <p className="text-gray-900 mt-1">
                {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'Not available'}
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Product ID</label>
            <p className="text-gray-900 mt-1 font-mono text-sm">{product._id}</p>
          </div>
          
          {product.sku && (
            <div>
              <label className="text-sm font-medium text-gray-600">SKU</label>
              <p className="text-gray-900 mt-1 font-mono text-sm">{product.sku}</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      {product.itemId && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Additional Information
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Item ID</label>
              <p className="text-gray-900 mt-1 font-mono text-sm">{product.itemId}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}