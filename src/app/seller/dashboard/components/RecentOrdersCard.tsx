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
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
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
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 8).map((order) => (
              <div
                key={order.id}
                className="group flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 font-medium text-xs">
                    #{order.orderNumber.slice(-3)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            <div className="p-4 border-t border-gray-100">
              <a 
                href="/seller/orders" 
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                View All Recent Activity <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </EmptyStateGuard>
      </div>
    </div>
  );
}
