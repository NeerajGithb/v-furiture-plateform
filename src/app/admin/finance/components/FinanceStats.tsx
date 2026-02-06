import { IndianRupee, TrendingUp, TrendingDown, Wallet, CreditCard, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { FinancialSummary } from '@/types/finance';

interface FinanceStatsProps {
    summary: FinancialSummary;
}

export default function FinanceStats({ summary }: FinanceStatsProps) {
    const cards = [
        {
            label: 'Total Revenue',
            value: formatCurrency(summary.totalRevenue),
            subtext: 'Paid Orders',
            icon: IndianRupee,
            trend: summary.revenueGrowth,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Platform Fees',
            value: formatCurrency(summary.platformFees),
            subtext: '10% Commission',
            icon: Wallet,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Completed Payouts',
            value: formatCurrency(summary.completedPayouts),
            subtext: 'Processed',
            icon: CreditCard,
            color: 'text-violet-600',
            bg: 'bg-violet-50'
        },
        {
            label: 'Pending Payouts',
            value: formatCurrency(summary.pendingPayouts),
            subtext: 'Processing',
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">{card.label}</h3>
                        <div className={`p-1.5 rounded-md ${card.bg}`}>
                            <card.icon className={`w-4 h-4 ${card.color}`} />
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-1">
                        <h2 className="text-2xl font-bold text-gray-900">{card.value}</h2>
                        {card.trend !== undefined && card.trend !== 0 && (
                            <div className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${card.trend > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                                }`}>
                                {card.trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                <span>{Math.abs(card.trend).toFixed(1)}%</span>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-gray-400 mt-1">{card.subtext}</p>
                </div>
            ))}
        </div>
    );
}
