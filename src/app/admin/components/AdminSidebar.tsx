'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  IndianRupee,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Store,
  Tag,
  Star
} from 'lucide-react';
import { useSidebar } from './AdminLayoutContent';
import { useAuthGuard } from '@/hooks/useAuthGuard';

const menuItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Sellers', href: '/admin/sellers', icon: Store },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Finance', href: '/admin/finance', icon: IndianRupee },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isCompact, setIsCompact } = useSidebar();
  const { logout } = useAuthGuard();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className={`${isCompact ? 'w-16' : 'w-64'
        } bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50`}
    >
      {/* Header */}
      <div className={`h-14 flex items-center border-b border-gray-200 ${isCompact ? 'justify-center px-2' : 'px-4'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!isCompact && (
            <span className="font-semibold text-gray-900 whitespace-nowrap">Admin Portal</span>
          )}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setIsCompact(!isCompact)}
        className="absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm z-10"
      >
        {isCompact ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md text-sm transition-colors ${isActive
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${isCompact ? 'justify-center py-2.5 px-2' : 'px-3 py-2'}`}
              title={isCompact ? item.label : ''}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gray-900' : 'text-gray-500'} flex-shrink-0`} />
              {!isCompact && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors ${isCompact ? 'justify-center py-2.5 px-2' : 'px-3 py-2'
            }`}
          title="Logout"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCompact && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
