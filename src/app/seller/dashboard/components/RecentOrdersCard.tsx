import { ShoppingCart, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { EmptyStateGuard } from '@/components/ui/EmptyStateGuard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SellerRecentOrder } from '@/types/seller/dashboard';

interface RecentOrdersCardProps {
  orders: SellerRecentOrder[];
}

export function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg h-full flex flex-col">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-[#F3F4F6] flex-shrink-0">
        <h3 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
          Recent Orders
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <EmptyStateGuard
          total={orders?.length || 0}
          empty={
            <EmptyState
              icon={ShoppingCart}
              title="No recent orders"
            />
          }
        >
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-2.5 border-b border-[#F3F4F6] bg-[#F8F9FA]">
            <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Order</span>
            <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Amount</span>
            <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Date</span>
          </div>

          <div>
            {orders.slice(0, 8).map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-3.5 border-b border-[#F9FAFB] hover:bg-[#F8F9FA] transition-colors duration-100 last:border-b-0"
              >
                {/* Order info */}
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#111111] truncate font-mono">
                    #{order.orderNumber}
                  </p>
                  <p className="text-[12px] text-[#9CA3AF] truncate mt-0.5">{order.customerName}</p>
                </div>

                {/* Amount */}
                <span className="text-[13px] font-semibold text-[#111111] tabular-nums">
                  {formatCurrency(order.totalAmount)}
                </span>

                {/* Date */}
                <span className="text-[12px] text-[#9CA3AF] tabular-nums whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>

          {/* Footer link */}
          <div className="px-5 py-3.5 border-t border-[#F3F4F6] bg-[#F8F9FA] flex-shrink-0">
            <a
              href="/seller/orders"
              className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#555555] hover:text-[#111111] transition-colors"
            >
              View All Orders
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </EmptyStateGuard>
      </div>
    </div>
  );
}
