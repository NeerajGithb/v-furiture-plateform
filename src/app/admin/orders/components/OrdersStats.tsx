'use client';

import React from 'react';
import {
    Package,
    CheckCircle,
    Clock,
    Truck,
    ShoppingBag,
    XCircle,
    RotateCcw,
    DollarSign,
    TrendingUp,
} from 'lucide-react';
import { OrderStats } from '@/types/admin/orders';

interface OrdersStatsProps {
    stats?: OrderStats;
    isLoading?: boolean;
}

export default function OrdersStats({ stats, isLoading }: OrdersStatsProps) {
    if (!stats) return null;
    
    const statCards = [
        {
            label: 'Total Orders',
            value: stats.total || 0,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            label: 'Pending',
            value: stats.pending || 0,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        {
            label: 'Confirmed',
            value: stats.confirmed || 0,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            label: 'Processing',
            value: stats.processing || 0,
            icon: ShoppingBag,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
        },
        {
            label: 'Shipped',
            value: stats.shipped || 0,
            icon: Truck,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            label: 'Delivered',
            value: stats.delivered || 0,
            icon: CheckCircle,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
        },
        {
            label: 'Cancelled',
            value: stats.cancelled || 0,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
        {
            label: 'Returned',
            value: stats.returned || 0,
            icon: RotateCcw,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
    ];

    const revenueStats = [
        {
            label: 'Total Revenue',
            value: stats.totalRevenue || 0,
            icon: DollarSign,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            format: 'currency',
        },
        {
            label: 'Paid Revenue',
            value: stats.paidRevenue || 0,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            format: 'currency',
        },
        {
            label: 'Pending Revenue',
            value: stats.pendingRevenue || 0,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            format: 'currency',
        },
        {
            label: 'Avg Order Value',
            value: stats.avgOrderValue || 0,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            format: 'currency',
        },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Order Status Stats */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className={`${stat.bgColor} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {stat.value.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Revenue Stats */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Revenue</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {revenueStats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`${stat.bgColor} w-10 h-10 rounded-lg flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {stat.format === 'currency'
                                        ? formatCurrency(stat.value)
                                        : stat.value.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
