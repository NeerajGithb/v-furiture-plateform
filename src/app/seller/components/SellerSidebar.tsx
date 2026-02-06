'use client';

import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Upload,
  DollarSign,
  Store,
  LogOut,
  User,
  Star,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useNavigate } from '@/components/NavigationLoader';
import { useSellerUnreadNotificationsCount } from '@/hooks/seller/useSellerNotificationsData';
import { useSidebar } from './SellerLayoutContent';

const menuItems = [
  { label: 'Overview', href: '/seller/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/seller/products', icon: Package },
  { label: 'Orders', href: '/seller/orders', icon: ShoppingCart },
  { label: 'Inventory', href: '/seller/inventory', icon: Upload },
  { label: 'Reviews', href: '/seller/reviews', icon: Star },
  { label: 'Earnings', href: '/seller/earnings', icon: DollarSign },
  { label: 'Profile', href: '/seller/profile', icon: User },
  { label: 'Notifications', href: '/seller/notifications', icon: Bell, showBadge: true },
];

export default function SellerSidebar() {
  const pathname = usePathname();
  const navigate = useNavigate();
  const { logout } = useAuthGuard();
  const { data: unreadCount } = useSellerUnreadNotificationsCount();
  const { isCompact, setIsCompact } = useSidebar();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className={`${isCompact ? 'w-16' : 'w-64'
        } bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50`}
    >
      {/* Header */}
      <div className={`h-16 flex items-center border-b border-gray-100 ${isCompact ? 'justify-center px-2' : 'px-6'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>
          {!isCompact && (
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight whitespace-nowrap">Seller Portal</h1>
              <p className="text-xs text-gray-500">Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCompact(!isCompact)}
        className="absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm z-10"
      >
        {isCompact ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          const showBadge = item.showBadge && (unreadCount ?? 0) > 0;

          return (
            <button
              key={item.href}
              onClick={() => navigate.push(item.href)}
              className={`w-full flex items-center gap-3 rounded-md transition-colors text-sm font-medium ${isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${isCompact ? 'justify-center py-2.5 px-2' : 'px-3 py-2'}`}
              title={isCompact ? item.label : ''}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gray-900' : 'text-gray-500'} flex-shrink-0`} />
              {!isCompact && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {showBadge && (
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ring-2 ring-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
              {isCompact && showBadge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 rounded-md text-gray-600 hover:bg-rose-50 hover:text-rose-700 transition-colors w-full text-sm font-medium ${isCompact ? 'justify-center py-2.5 px-2' : 'px-3 py-2'
            }`}
          title={isCompact ? 'Sign Out' : ''}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCompact && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
