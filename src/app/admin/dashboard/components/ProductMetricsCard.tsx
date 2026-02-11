import type { ProductMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface ProductMetricsCardProps {
  products: ProductMetrics;
}

export default function ProductMetricsCard({ products }: ProductMetricsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Product Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <MetricItem label="Total Products" value={products.totalProducts.toLocaleString('en-IN')} />
        <MetricItem label="Published" value={products.publishedProducts.toLocaleString('en-IN')} />
        <MetricItem label="Pending" value={products.pendingProducts.toLocaleString('en-IN')} />
        <MetricItem label="Draft" value={products.draftProducts.toLocaleString('en-IN')} />
        <MetricItem label="Out of Stock" value={products.outOfStockProducts.toLocaleString('en-IN')} />
        <MetricItem label="Low Stock" value={products.lowStockProducts.toLocaleString('en-IN')} />
        <MetricItem label="Categories" value={products.totalCategories.toLocaleString('en-IN')} />
      </div>
    </div>
  );
}
