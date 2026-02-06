import { Plus, Download, RefreshCw } from 'lucide-react';
import { useNavigate } from '@/components/NavigationLoader';
import { ProductStats } from '@/types/sellerProducts';

interface ProductsHeaderProps {
  stats: ProductStats;
  onExport: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function ProductsHeader({ stats, onExport, onRefresh, refreshing }: ProductsHeaderProps) {
  const router = useNavigate();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory and listings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => router.push('/seller/products/new')}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
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
    </div>
  );
}