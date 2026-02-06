import { Eye, ShoppingCart, Heart, Star } from 'lucide-react';
import { ProductAnalyticsProps } from '@/types';

export default function ProductAnalytics({ products, reviews }: ProductAnalyticsProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h2 className="text-base font-bold text-gray-900 mb-3">Product Analytics</h2>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">Total Views</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{products.totalViews.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-700">Total Sold (Paid Orders)</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{products.totalSold.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-pink-50 rounded-lg border border-pink-200">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-600" />
            <span className="text-xs font-medium text-gray-700">Total Wishlisted</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{products.totalWishlisted.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium text-gray-700">Avg Rating</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{reviews.avgRating.toFixed(1)} ⭐</span>
        </div>
      </div>
    </div>
  );
}
