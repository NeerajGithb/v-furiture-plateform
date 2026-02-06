import Image from 'next/image';
import { Package, ExternalLink, Eye, Star } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { OrderItemsProps } from '@/types/sellerOrder';

export function OrderItems({ items }: OrderItemsProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-500" />
          Order Items
        </h3>
        <div className="text-sm text-gray-500">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} • {formatCurrency(totalValue)}
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item._id || index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="w-20 h-20 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
              {item.productImage || item.productId?.mainImage?.url ? (
                <Image
                  src={item.productImage || item.productId?.mainImage?.url}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate mb-1">{item.name}</h4>
                  
                  {item.sku && (
                    <p className="text-xs text-gray-500 mb-2 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                      SKU: {item.sku}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>Qty: <span className="font-medium text-gray-900">{item.quantity}</span></span>
                    <span>Price: <span className="font-medium text-gray-900">{formatCurrency(item.price)}</span></span>
                  </div>

                  {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">Selected Options:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.selectedVariant).map(([key, value]) => (
                          <span key={key} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {item.productId?._id && (
                      <button
                        onClick={() => window.open(`/seller/products/${item.productId._id}`, '_blank')}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View Product
                      </button>
                    )}
                    
                    {item.productId?.slug && (
                      <button
                        onClick={() => window.open(`/products/${item.productId.slug}`, '_blank')}
                        className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Public Page
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <p className="font-bold text-gray-900 text-lg">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-500">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Items Subtotal ({totalItems} items)</span>
          <span className="font-semibold text-gray-900">{formatCurrency(totalValue)}</span>
        </div>
      </div>
    </div>
  );
}
