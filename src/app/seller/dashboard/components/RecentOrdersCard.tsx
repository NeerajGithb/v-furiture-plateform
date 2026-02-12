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
    <div className="bg-white border border-slate-200 rounded-lg h-full flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
          Recent Orders
        </h3>
      </div>

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
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 8).map((order) => (
              <div
                key={order.id}
                className="group flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-semibold text-xs flex-shrink-0">
                    #{order.orderNumber.slice(-3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-slate-600 truncate">{order.customerName}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold text-slate-900 tabular-nums">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <a
                href="/seller/orders"
                className="flex items-center justify-center gap-2 text-sm text-slate-700 hover:text-slate-900 font-semibold transition-colors"
              >
                View All Orders <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </EmptyStateGuard>
      </div>
    </div>
  );
}
