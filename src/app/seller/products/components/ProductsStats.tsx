import { ProductStats } from '@/types/seller/products';

interface ProductsStatsProps {
  stats: ProductStats;
}

export function ProductsStats({ stats }: ProductsStatsProps) {
  const statItems = [
    { label: 'Total Products', value: stats.total, color: 'bg-blue-50 border-blue-100 text-blue-700', textColor: 'text-blue-900' },
    { label: 'Published', value: stats.published, color: 'bg-emerald-50 border-emerald-100 text-emerald-700', textColor: 'text-emerald-900' },
    { label: 'Draft', value: stats.draft, color: 'bg-amber-50 border-amber-100 text-amber-700', textColor: 'text-amber-900' },
    { label: 'Low Stock', value: stats.lowStock, color: 'bg-rose-50 border-rose-100 text-rose-700', textColor: 'text-rose-900' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {statItems.map((stat) => (
        <div key={stat.label} className={`${stat.color} border rounded-lg p-6`}>
          <p className="text-sm font-semibold uppercase tracking-wide mb-2">{stat.label}</p>
          <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
