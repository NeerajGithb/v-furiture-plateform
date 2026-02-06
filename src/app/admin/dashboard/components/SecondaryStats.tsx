import { UserCheck, ShoppingBag, Search, Star } from 'lucide-react';
import { SecondaryStatsProps } from '@/types';

export default function SecondaryStats({ users, engagement, search, reviews }: SecondaryStatsProps) {
  const items = [
    { label: 'Conversion Rate', value: `${engagement.cartAbandonmentRate.toFixed(1)}%`, icon: ShoppingBag },
    { label: 'Unique Visits', value: users.uniqueCustomers, icon: UserCheck },
    { label: 'Total Searches', value: search.totalSearches, icon: Search },
    { label: 'Pending Reviews', value: reviews.pending, icon: Star },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{item.label}</h3>
            <item.icon className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
