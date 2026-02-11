import { ProductStats } from '@/types/seller/products';

interface ProductsStatsProps {
  stats: ProductStats;
}

export function ProductsStats({ stats }: ProductsStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-600">Total Products</p>
        <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
      </div>
      <div className="bg-green-50 rounded-lg p-4">
        <p className="text-sm font-medium text-green-600">Published</p>
        <p className="text-2xl font-bold text-green-900">{stats.published}</p>
      </div>
      <div className="bg-yellow-50 rounded-lg p-4">
        <p className="text-sm font-medium text-yellow-600">Draft</p>
        <p className="text-2xl font-bold text-yellow-900">{stats.draft}</p>
      </div>
      <div className="bg-red-50 rounded-lg p-4">
        <p className="text-sm font-medium text-red-600">Low Stock</p>
        <p className="text-2xl font-bold text-red-900">{stats.lowStock}</p>
      </div>
    </div>
  );
}
