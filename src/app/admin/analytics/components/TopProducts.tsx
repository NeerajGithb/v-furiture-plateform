import { formatCurrency } from '@/utils/currency';
import { TopPerformers } from '@/types/admin/analytics';

interface TopProductsProps {
  topPerformers: TopPerformers;
}

export default function TopProducts({ topPerformers }: TopProductsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
      <div className="space-y-3">
        {topPerformers.topProducts.slice(0, 5).map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
            <div>
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500">{product.category}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {formatCurrency(product.revenue)}
              </div>
              <div className="text-sm text-gray-500">{product.orders.toLocaleString('en-IN')} orders</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
