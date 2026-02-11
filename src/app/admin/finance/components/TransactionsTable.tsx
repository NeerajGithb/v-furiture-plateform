import { formatCurrency } from '@/utils/currency';
import { FinanceTransaction } from '@/types/admin/finance';

interface TransactionsTableProps {
    transactions: FinanceTransaction[];
}

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            shipped: 'bg-blue-50 text-blue-700 ring-blue-600/20',
            processing: 'bg-violet-50 text-violet-700 ring-violet-600/20',
            pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
            cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20',
            confirmed: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
        };
        const style = styles[status.toLowerCase()] || 'bg-gray-50 text-gray-700 ring-gray-600/20';

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${style} capitalize`}>
                {status}
            </span>
        );
    };

    const getPaymentBadge = (status: string) => {
        const styles: Record<string, string> = {
            paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
            failed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
            refunded: 'bg-gray-50 text-gray-700 ring-gray-600/20',
        };
        const style = styles[status.toLowerCase()] || 'bg-gray-50 text-gray-700 ring-gray-600/20';

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${style} capitalize`}>
                {status}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
                <span className="text-xs text-gray-500">Paid Orders Only</span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Order ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Fee (10%)</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Payout</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">Order Status</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">Payment</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{transaction.orderNumber}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        <div className="font-medium text-gray-900">{transaction.customerName}</div>
                                        <div className="text-xs text-gray-500">{transaction.customerEmail}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(transaction.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(transaction.totalAmount)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(transaction.platformFee)}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{formatCurrency(transaction.payout)}</td>
                                    <td className="px-4 py-3 text-center">
                                        {getStatusBadge(transaction.orderStatus)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {getPaymentBadge(transaction.paymentStatus)}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
