import { Package, Clock, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import type { ProductStats } from '@/types/admin/products';

interface ProductsOverviewProps {
    stats?: ProductStats;
    isLoading: boolean;
    onNavigate: (tab: string) => void;
}

export default function ProductsOverview({ stats, isLoading, onNavigate }: ProductsOverviewProps) {
    if (isLoading) {
        return (
            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Product Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="animate-pulse">
                                <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-12"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Product Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                        <span className="text-xs font-medium text-green-600">Published</span>
                        <Eye className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.published.toLocaleString()}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Unpublished</span>
                        <EyeOff className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.unpublished.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
