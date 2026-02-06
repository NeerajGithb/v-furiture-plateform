
import { Package, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { AdminProductStats } from '@/types/adminProduct';

interface ProductsOverviewProps {
    stats: AdminProductStats;
    onNavigate: (tab: string) => void;
}

export default function ProductsOverview({ stats, onNavigate }: ProductsOverviewProps) {
    return (
        <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Product Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Total Products</span>
                        <Package className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                </div>

                <div
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-amber-300 cursor-pointer transition-all"
                    onClick={() => onNavigate('pending')}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-amber-600">Pending</span>
                        <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending.toLocaleString()}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Approved</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.approved.toLocaleString()}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Rejected</span>
                        <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.rejected.toLocaleString()}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Unpublished</span>
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.unpublished.toLocaleString()}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Approval Rate</span>
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                    </p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={() => onNavigate('pending')}
                            className="flex items-center justify-between px-4 py-3 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                        >
                            <span>Review Pending Products</span>
                            <span className="bg-white px-2 py-0.5 rounded text-amber-800 text-xs font-bold border border-amber-100">{stats.pending}</span>
                        </button>
                        <button
                            onClick={() => onNavigate('all')}
                            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        >
                            View All Products
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
