import { formatCurrency } from '@/utils/currency';
import { RecentActivityProps } from '@/types';

export default function RecentActivity({ users, sellers, orders }: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Users */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Recent Users</h3>
          <span className="text-xs text-gray-500">{users.length} new</span>
        </div>
        <div className="divide-y divide-gray-100">
          {users.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">No recent users</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${user.verified
                  ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10'
                  : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10'
                  }`}>
                  {user.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Sellers */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Recent Sellers</h3>
          <span className="text-xs text-gray-500">{sellers.length} new</span>
        </div>
        <div className="divide-y divide-gray-100">
          {sellers.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">No recent sellers</p>
          ) : (
            sellers.map((seller) => (
              <div key={seller.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{seller.businessName}</p>
                  <p className="text-xs text-gray-500 truncate">{seller.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${seller.status === 'active' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10' :
                  seller.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10' :
                    'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/10'
                  }`}>
                  {seller.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
          <span className="text-xs text-gray-500">{orders.length} new</span>
        </div>
        <div className="divide-y divide-gray-100">
          {orders.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">No recent orders</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{order.orderId}</p>
                  <p className="text-xs text-gray-500 truncate text-ellipsis max-w-[120px]">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount, true)}</p>
                  <p className={`text-xs capitalize font-medium ${order.status === 'delivered' ? 'text-green-700' :
                    order.status === 'cancelled' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                    {order.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
