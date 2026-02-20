'use client';

import Link from 'next/link';
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
import { useSellerNotificationUnreadCount } from '@/hooks/seller/useSellerNotifications';
import { useSidebar } from './SellerLayoutContent';

const menuItems = [
  { label: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
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
  const { logout } = useAuthGuard();
  const { data: unreadCount } = useSellerNotificationUnreadCount();
  const { isCompact, setIsCompact } = useSidebar();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      aria-label="Seller navigation"
      className={`${isCompact ? 'w-[60px]' : 'w-[220px]'
        } bg-[#111111] h-screen fixed left-0 top-0 flex flex-col transition-all duration-200 z-50 border-r border-[#222222]`}
    >
      {/* Logo */}
      <div className={`h-14 flex items-center border-b border-[#222222] flex-shrink-0 ${isCompact ? 'justify-center px-0' : 'px-5'}`}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4 text-[#111111]" />
          </div>
          {!isCompact && (
            <span className="font-semibold text-[13px] text-white whitespace-nowrap tracking-tight">
              Seller Portal
            </span>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsCompact(!isCompact)}
        aria-label={isCompact ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-[52px] w-6 h-6 bg-[#111111] border border-[#333333] rounded-full flex items-center justify-center text-[#888888] hover:text-white transition-colors shadow-md z-10"
      >
        {isCompact ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Navigation */}
      <nav aria-label="Main menu" className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          const showBadge = item.showBadge && (unreadCount || 0) > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCompact ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={`
                flex items-center gap-2.5 rounded-md text-[13px] font-medium transition-all duration-150 relative
                ${isCompact ? 'justify-center py-2.5 px-2' : 'px-3 py-2'}
                ${isActive
                  ? 'bg-white text-[#111111]'
                  : 'text-[#999999] hover:bg-[#1C1C1C] hover:text-white'
                }
              `}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#111111]' : ''}`} />
              {!isCompact && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="ml-auto bg-white text-[#111111] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                      {(unreadCount || 0) > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
              {isCompact && showBadge && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sign out */}
      <div className="px-2 pb-3 border-t border-[#222222] pt-2 flex-shrink-0">
        <button
          onClick={handleLogout}
          title="Sign Out"
          className={`
            flex items-center gap-2.5 rounded-md text-[13px] font-medium text-[#666666]
            hover:bg-[#1C1C1C] hover:text-white w-full transition-all duration-150
            ${isCompact ? 'justify-center py-2.5 px-2' : 'px-3 py-2'}
          `}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCompact && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
