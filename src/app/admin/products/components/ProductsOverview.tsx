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
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 mb-6">
                <h3 className="text-[15px] font-semibold text-[#111111] mb-4 tracking-tight">Product Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="border border-[#E5E7EB] rounded-md p-4">
                            <div className="animate-pulse">
                                <div className="h-3 bg-[#F1F3F5] rounded w-20 mb-2"></div>
                                <div className="h-6 bg-[#F1F3F5] rounded w-12"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 mb-6">
            <h3 className="text-[15px] font-semibold text-[#111111] mb-4 tracking-tight">Product Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="border border-[#E5E7EB] rounded-md p-4 hover:border-[#D1D5DB] hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Total Products</span>
                        <Package className="w-4 h-4 text-[#9CA3AF]" />
                    </div>
                    <p className="text-[22px] font-semibold text-[#111111] tracking-tight">{stats.total.toLocaleString()}</p>
                </div>

                <div
                    className="border border-[#E5E7EB] rounded-md p-4 hover:border-[#D97706] hover:shadow-sm cursor-pointer transition-all"
                    onClick={() => onNavigate('pending')}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-[#D97706] uppercase tracking-wider">Pending</span>
                        <Clock className="w-4 h-4 text-[#D97706]" />
                    </div>
                    <p className="text-[22px] font-semibold text-[#111111] tracking-tight">{stats.pending.toLocaleString()}</p>
                </div>

                <div className="border border-[#E5E7EB] rounded-md p-4 hover:border-[#D1D5DB] hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Approved</span>
                        <CheckCircle className="w-4 h-4 text-[#059669]" />
                    </div>
                    <p className="text-[22px] font-semibold text-[#111111] tracking-tight">{stats.approved.toLocaleString()}</p>
                </div>

                <div className="border border-[#E5E7EB] rounded-md p-4 hover:border-[#D1D5DB] hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Rejected</span>
                        <XCircle className="w-4 h-4 text-[#DC2626]" />
                    </div>
                    <p className="text-[22px] font-semibold text-[#111111] tracking-tight">{stats.rejected.toLocaleString()}</p>
                </div>

                <div className="border border-[#E5E7EB] rounded-md p-4 hover:border-[#D1D5DB] hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-[#059669] uppercase tracking-wider">Published</span>
                        <Eye className="w-4 h-4 text-[#059669]" />
                    </div>
                    <p className="text-[22px] font-semibold text-[#111111] tracking-tight">{stats.published.toLocaleString()}</p>
                </div>

                <div className="border border-[#E5E7EB] rounded-md p-4 hover:border-[#D1D5DB] hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Unpublished</span>
                        <EyeOff className="w-4 h-4 text-[#9CA3AF]" />
                    </div>
                    <p className="text-[22px] font-semibold text-[#111111] tracking-tight">{stats.unpublished.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
