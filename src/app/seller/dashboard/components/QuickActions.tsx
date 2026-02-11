import { Package, ShoppingCart, BarChart3, Users } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { href: '/seller/products/add', icon: Package, label: 'Add Product' },
    { href: '/seller/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/seller/earnings', icon: BarChart3, label: 'Earnings' },
    { href: '/seller/reviews', icon: Users, label: 'Reviews' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="flex flex-col items-center justify-center p-3 text-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all group"
          >
            <action.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-900 mb-2 transition-colors" />
            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
              {action.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
