import { Package, ShoppingCart, BarChart3, Users } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { href: '/seller/products/add', icon: Package, label: 'Add Product' },
    { href: '/seller/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/seller/earnings', icon: BarChart3, label: 'Earnings' },
    { href: '/seller/reviews', icon: Users, label: 'Reviews' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-5 uppercase tracking-wide">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="flex flex-col items-center justify-center p-4 text-center border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm transition-all group"
          >
            <action.icon className="w-6 h-6 text-slate-400 group-hover:text-slate-900 mb-2 transition-colors" />
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
              {action.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
