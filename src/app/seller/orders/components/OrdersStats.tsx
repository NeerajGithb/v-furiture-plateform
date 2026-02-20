'use client';

import { ShoppingCart, Clock, Package, Truck, CheckCircle } from 'lucide-react';
import { OrdersStatsProps } from '@/types/seller/orders';

const statConfig = [
  { key: 'total' as const, label: 'Total Orders', icon: ShoppingCart, dot: 'bg-[#6B7280]' },
  { key: 'pending' as const, label: 'Pending', icon: Clock, dot: 'bg-amber-400' },
  { key: 'processing' as const, label: 'Processing', icon: Package, dot: 'bg-blue-400' },
  { key: 'shipped' as const, label: 'Shipped', icon: Truck, dot: 'bg-violet-400' },
  { key: 'delivered' as const, label: 'Delivered', icon: CheckCircle, dot: 'bg-emerald-400' },
];

export default function OrdersStats({ stats }: OrdersStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statConfig.map(({ key, label, icon: Icon, dot }) => (
        <div
          key={key}
          className="bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
              {label}
            </span>
            <div className="w-7 h-7 bg-[#F8F9FA] border border-[#F3F4F6] rounded-md flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
            <span className="text-[24px] font-bold text-[#111111] tabular-nums leading-none">
              {stats?.[key] || 0}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}