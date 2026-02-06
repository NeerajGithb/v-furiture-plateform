import { Package, User, IndianRupee, Box, Ruler, Weight, Tag, Calendar } from 'lucide-react';
import { AdminProduct } from '@/types/adminProduct';
import { formatCurrency } from '@/utils/currency';

interface ProductDetailsProps {
  product: AdminProduct;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Basic Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Product Name</label>
            <p className="text-sm font-medium">{product.name}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">SKU</label>
            <p className="text-sm font-medium">{product.sku || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Brand</label>
            <p className="text-sm font-medium">{product.brand || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Material</label>
            <p className="text-sm font-medium">{product.material || 'N/A'}</p>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500">Description</label>
            <p className="text-sm text-gray-700">{product.description || 'No description'}</p>
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Seller Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Business Name</label>
            <p className="text-sm font-medium">{product.sellerId?.businessName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Email</label>
            <p className="text-sm font-medium">{product.sellerId?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Phone</label>
            <p className="text-sm font-medium">{product.sellerId?.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Seller ID</label>
            <p className="text-sm font-medium text-gray-600">{typeof product.sellerId === 'object' ? product.sellerId?._id : product.sellerId || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <IndianRupee className="w-4 h-4" />
          Pricing & Stock
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500">Original Price</label>
            <p className="text-sm font-medium">{formatCurrency(product.originalPrice || 0)}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Final Price</label>
            <p className="text-sm font-medium text-green-600">{formatCurrency(product.finalPrice || 0)}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Discount</label>
            <p className="text-sm font-medium">{product.discountPercent || 0}%</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Stock Quantity</label>
            <p className="text-sm font-medium">{product.inStockQuantity || 0}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">EMI Price</label>
            <p className="text-sm font-medium">{product.emiPrice ? formatCurrency(product.emiPrice) : 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Category</label>
            <p className="text-sm font-medium">{product.categoryId?.name || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Box className="w-4 h-4" />
          Specifications
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {product.dimensions && (
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                Dimensions (L×W×H)
              </label>
              <p className="text-sm font-medium">
                {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
              </p>
            </div>
          )}
          {product.weight && (
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1">
                <Weight className="w-3 h-3" />
                Weight
              </label>
              <p className="text-sm font-medium">{product.weight} kg</p>
            </div>
          )}
          {product.colorOptions && product.colorOptions.length > 0 && (
            <div>
              <label className="text-xs text-gray-500">Colors</label>
              <p className="text-sm font-medium">{product.colorOptions.join(', ')}</p>
            </div>
          )}
          {product.size && product.size.length > 0 && (
            <div>
              <label className="text-xs text-gray-500">Sizes</label>
              <p className="text-sm font-medium">{product.size.join(', ')}</p>
            </div>
          )}
          {product.warranty && (
            <div>
              <label className="text-xs text-gray-500">Warranty</label>
              <p className="text-sm font-medium">{product.warranty}</p>
            </div>
          )}
          {product.returnPolicy && (
            <div>
              <label className="text-xs text-gray-500">Return Policy</label>
              <p className="text-sm font-medium">{product.returnPolicy}</p>
            </div>
          )}
        </div>
      </div>

      {/* Marketing & Tags */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Marketing & Tags
        </h3>
        <div className="space-y-3">
          {product.tags && product.tags.length > 0 && (
            <div>
              <label className="text-xs text-gray-500">Tags</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {product.badge && (
            <div>
              <label className="text-xs text-gray-500">Badge</label>
              <p className="text-sm font-medium">{product.badge}</p>
            </div>
          )}
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={product.isFeatured} disabled className="rounded" />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={product.isNewArrival} disabled className="rounded" />
              New Arrival
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={product.isBestSeller} disabled className="rounded" />
              Best Seller
            </label>
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      {product.shippingInfo && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Shipping Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500">Free Shipping</label>
              <p className="text-sm font-medium">{product.shippingInfo.freeShipping ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Estimated Days</label>
              <p className="text-sm font-medium">{product.shippingInfo.estimatedDays || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Shipping Cost</label>
              <p className="text-sm font-medium">{formatCurrency(product.shippingInfo.shippingCost || 0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Timeline & Approval
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Created</span>
            <span className="font-medium">{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Updated</span>
            <span className="font-medium">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'}</span>
          </div>
          {product.approvedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Approved/Reviewed</span>
              <span className="font-medium">{new Date(product.approvedAt).toLocaleDateString()}</span>
            </div>
          )}
          {product.approvedBy && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Reviewed By</span>
              <span className="font-medium text-gray-600">
                {typeof product.approvedBy === 'object' && product.approvedBy.email 
                  ? product.approvedBy.email 
                  : typeof product.approvedBy === 'string' 
                  ? product.approvedBy 
                  : 'N/A'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Reason */}
      {(product.status === 'REJECTED' || product.status === 'rejected') && product.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason</h3>
          <p className="text-sm text-red-700">{product.rejectionReason}</p>
        </div>
      )}
    </div>
  );
}