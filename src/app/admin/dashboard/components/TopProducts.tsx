import { Eye, TrendingUp, Heart } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { TopProductsProps } from '@/types';

export default function TopProducts({ mostViewed, bestSellers, mostWishlisted }: TopProductsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Most Viewed */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Most Viewed</h3>
          <Eye className="w-4 h-4 text-gray-400" />
        </div>
        <div className="divide-y divide-gray-100">
          {mostViewed.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">No data available</p>
          ) : (
            mostViewed.map((product) => (
              <div key={product.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-violet-700 transition-colors">{product.name}</p>
                  <p className="text-xs text-gray-500">{(product.viewCount || 0).toLocaleString()} views</p>
                </div>
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Best Sellers */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Best Sellers</h3>
          <TrendingUp className="w-4 h-4 text-gray-400" />
        </div>
        <div className="divide-y divide-gray-100">
          {bestSellers.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">No data available</p>
          ) : (
            bestSellers.map((product) => (
              <div key={product.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-violet-700 transition-colors">{product.name}</p>
                  <p className="text-xs text-gray-500">{(product.totalSold || 0).toLocaleString()} sold</p>
                </div>
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Wishlisted */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Most Wishlisted</h3>
          <Heart className="w-4 h-4 text-gray-400" />
        </div>
        <div className="divide-y divide-gray-100">
          {mostWishlisted.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">No data available</p>
          ) : (
            mostWishlisted.map((product) => (
              <div key={product.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-violet-700 transition-colors">{product.name}</p>
                  <p className="text-xs text-gray-500">{(product.wishlistCount || 0).toLocaleString()} wishlists</p>
                </div>
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
