import { Clock, Package, Truck, CheckCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { SellerOrderStats, SellerRevenueStats } from '@/types/seller/dashboard';

interface OrderStatusCardProps {
  orders: SellerOrderStats;
  revenue: SellerRevenueStats;
}

const statusRows = [
  {
    key: 'pending' as const,
    label: 'Pending',
    icon: Clock,
    dot: 'bg-amber-400',
  },
  {
    key: 'processing' as const,
    label: 'Processing',
    icon: Package,
    dot: 'bg-blue-400',
  },
  {
    key: 'shipped' as const,
    label: 'Shipped',
    icon: Truck,
    dot: 'bg-violet-400',
  },
  {
    key: 'delivered' as const,
    label: 'Delivered',
    icon: CheckCircle,
    dot: 'bg-emerald-400',
  },
];

export function OrderStatusCard({ orders, revenue }: OrderStatusCardProps) {
  const avgOrderValue = (revenue.total || 0) / Math.max(orders.total || 1, 1);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-[#F3F4F6]">
        <h3 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
          Order Status
        </h3>
      </div>

      {/* Status rows */}
      <div className="px-5 py-4 space-y-3">
        {statusRows.map(({ key, label, icon: Icon, dot }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
              <span className="text-[13px] text-[#555555] font-medium">{label}</span>
            </div>
            <span className="text-[13px] font-semibold text-[#111111] tabular-nums">
              {orders[key] ?? 0}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#F3F4F6] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#9CA3AF] font-medium">Avg. Order Value</span>
          <span className="text-[13px] font-semibold text-[#111111] tabular-nums">
            {formatCurrency(avgOrderValue)}
          </span>
        </div>
        <a
          href="/seller/orders"
          className="
            flex items-center justify-center gap-1.5 w-full py-2 text-[12px] font-semibold
            text-[#555555] border border-[#E5E7EB] rounded-md
            hover:bg-[#F8F9FA] hover:text-[#111111] hover:border-[#D1D5DB]
            transition-all duration-150
          "
        >
          View All Orders
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
