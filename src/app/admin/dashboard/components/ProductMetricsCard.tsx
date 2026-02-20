import type { ProductMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface ProductMetricsCardProps {
  products: ProductMetrics;
}

export default function ProductMetricsCard({ products }: ProductMetricsCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
      <h2 className="text-[15px] font-semibold text-[#111111] mb-5 tracking-tight">Product Metrics</h2>
      <div className="flex flex-wrap gap-6">
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
