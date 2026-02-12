'use client';

import { ShoppingCart, Clock, Package, Truck, CheckCircle } from 'lucide-react';
import { OrdersStatsProps } from '@/types/seller/orders';

export default function OrdersStats({ stats }: OrdersStatsProps) {
  const statItems = [
    {
      label: 'Total Orders',
      value: stats?.total || 0,
      icon: ShoppingCart,
      bgColor: 'bg-slate-50',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600'
    },
    {
      label: 'Pending',
      value: stats?.pending || 0,
      icon: Clock,
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      label: 'Processing',
      value: stats?.processing || 0,
      icon: Package,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Shipped',
      value: stats?.shipped || 0,
      icon: Truck,
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      label: 'Delivered',
      value: stats?.delivered || 0,
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
      {statItems.map((stat) => (
        <div key={stat.label} className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 ${stat.iconBg} rounded-lg`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{stat.label}</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}