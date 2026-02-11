import { ShoppingCart, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { FinancialStats } from '@/types/admin/finance';

interface TransactionStatsProps {
    stats: FinancialStats;
}

export default function TransactionStats({ stats }: TransactionStatsProps) {
    const items = [
        { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingCart },
        { label: 'Completed', value: stats.completedOrders.toLocaleString(), icon: CheckCircle },
        { label: 'Pending', value: stats.pendingOrders.toLocaleString(), icon: Clock },
        { label: 'Total Payments', value: stats.totalPayments.toLocaleString(), icon: CreditCard }, // Assuming totalPayments is a count based on provided page.tsx usage, or simpler formatting if it's amount but shown as string.
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {items.map((item, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                        <p className="text-xl font-bold text-gray-900">{item.value}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <item.icon className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            ))}
        </div>
    );
}
