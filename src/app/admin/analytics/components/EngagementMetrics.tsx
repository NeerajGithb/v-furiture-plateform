import { ShoppingCart, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { EngagementMetricsProps } from '@/types';

export default function EngagementMetrics({ engagement }: EngagementMetricsProps) {
  const metrics = [
    { label: 'Added to Cart', value: engagement.totalAddedToCart.toLocaleString(), icon: ShoppingCart, bg: 'bg-indigo-50', color: 'text-indigo-600' },
    { label: 'Added to Wishlist', value: engagement.totalAddedToWishlist.toLocaleString(), icon: Heart, bg: 'bg-rose-50', color: 'text-rose-600' },
    { label: 'Cart Abandonment', value: `${engagement.cartAbandonmentRate.toFixed(1)}%`, icon: AlertCircle, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Conversion Rate', value: `${engagement.conversionRate.toFixed(1)}%`, icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  ];

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <h2 className="text-base font-bold text-gray-900 mb-4">Engagement Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-4 border border-gray-100 rounded-lg bg-white flex flex-col items-center text-center">
            <div className={`p-2 rounded-full mb-2 ${metric.bg}`}>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            <div className="text-xs font-medium text-gray-500 mt-1">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
