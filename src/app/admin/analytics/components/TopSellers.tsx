import { formatCurrency } from '@/utils/currency';
import { TopPerformers } from '@/types/admin/analytics';

interface TopSellersProps {
  topPerformers: TopPerformers;
}

export default function TopSellers({ topPerformers }: TopSellersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Sellers</h3>
      <div className="space-y-3">
        {topPerformers.topSellers.slice(0, 5).map((seller) => (
          <div key={seller.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
            <div>
              <div className="font-medium text-gray-900">{seller.name}</div>
              <div className="text-sm text-gray-500">{seller.orders.toLocaleString('en-IN')} orders</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {formatCurrency(seller.revenue)}
              </div>
              <div className="text-sm text-gray-500">
                Commission: {formatCurrency(seller.commission)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
