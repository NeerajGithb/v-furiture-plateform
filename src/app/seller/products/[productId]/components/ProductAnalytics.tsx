import { TrendingUp, Eye, ShoppingCart, DollarSign } from 'lucide-react';
import { SellerProduct } from '@/types/seller/products';

interface ProductAnalyticsProps {
  product: SellerProduct;
  analytics?: {
    views: { date: string; count: number }[];
    sales: { date: string; count: number; revenue: number }[];
    topPerformers: {
      productId: string;
      name: string;
      views: number;
      sales: number;
      revenue: number;
    }[];
    categoryPerformance: {
      categoryId: string;
      categoryName: string;
      products: number;
      sales: number;
      revenue: number;
    }[];
  };
}

export function ProductAnalytics({ product, analytics }: ProductAnalyticsProps) {
  const totalViews = analytics?.views.reduce((sum, item) => sum + item.count, 0) || 0;
  const totalSales = analytics?.sales.reduce((sum, item) => sum + item.count, 0) || 0;
  const totalRevenue = analytics?.sales.reduce((sum, item) => sum + item.revenue, 0) || 0;
  const conversionRate = totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-600">Total Views</p>
              <p className="text-2xl font-bold text-blue-900">{totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-600">Total Sales</p>
              <p className="text-2xl font-bold text-green-900">{totalSales.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-600">Revenue</p>
              <p className="text-2xl font-bold text-purple-900">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0,
                }).format(totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-orange-900">{conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Over Time</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Average Daily Views</p>
              <p className="text-sm text-gray-600">Based on last 30 days</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {analytics?.views.length ? Math.round(totalViews / analytics.views.length) : 0}
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Average Order Value</p>
              <p className="text-sm text-gray-600">Revenue per sale</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {totalSales > 0 
                ? new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 2,
                  }).format(totalRevenue / totalSales)
                : '₹0.00'
              }
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Stock Level</p>
              <p className="text-sm text-gray-600">Current inventory</p>
            </div>
            <p className={`text-xl font-bold ${
              (product.inStockQuantity || 0) > 10 
                ? 'text-green-600' 
                : (product.inStockQuantity || 0) > 0 
                ? 'text-yellow-600' 
                : 'text-red-600'
            }`}>
              {product.inStockQuantity || 0} units
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Recommendations</h3>
        <div className="space-y-3">
          {(product.inStockQuantity || 0) < 5 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Low Stock Alert</p>
                <p className="text-sm text-gray-600">Consider restocking this product soon to avoid stockouts.</p>
              </div>
            </div>
          )}
          
          {parseFloat(conversionRate) < 2 && totalViews > 100 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Low Conversion Rate</p>
                <p className="text-sm text-gray-600">Consider optimizing product images, description, or pricing to improve conversions.</p>
              </div>
            </div>
          )}
          
          {totalViews < 50 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Increase Visibility</p>
                <p className="text-sm text-gray-600">Consider promoting this product or improving SEO to increase views.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}