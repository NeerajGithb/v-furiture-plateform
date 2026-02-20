import { Package, ShoppingCart, BarChart3, Star } from 'lucide-react';

const actions = [
  { href: '/seller/products/add', icon: Package, label: 'Add Product' },
  { href: '/seller/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/seller/earnings', icon: BarChart3, label: 'Earnings' },
  { href: '/seller/reviews', icon: Star, label: 'Reviews' },
];

export function QuickActions() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-[#F3F4F6]">
        <h3 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
          Quick Actions
        </h3>
      </div>

      {/* Grid of actions */}
      <div className="p-4 grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="
              group flex flex-col items-center justify-center gap-2 p-3
              border border-[#E5E7EB] rounded-md text-center
              hover:bg-[#F8F9FA] hover:border-[#D1D5DB]
              transition-all duration-150
            "
          >
            <action.icon className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#111111] transition-colors" />
            <span className="text-[12px] font-medium text-[#6B7280] group-hover:text-[#111111] transition-colors">
              {action.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
