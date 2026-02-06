
import React from 'react';
import {
    Store, Mail, Phone, CheckCircle, XCircle,
    ChevronDown, ChevronUp, MoreHorizontal,
    TrendingUp, Package, Shield, ShieldCheck, MapPin
} from 'lucide-react';
import { AdminSeller } from '@/types/seller';
import { formatCurrency } from '@/utils/currency';
import { useRouter } from 'next/navigation';

interface SellersTableProps {
    sellers: AdminSeller[];
    expandedSeller: string | null;
    onToggleExpand: (sellerId: string) => void;
    onUpdateStatus: (sellerId: string, status: string) => void;
    onUpdateVerified: (sellerId: string, verified: boolean) => void;
}

export default function SellersTable({
    sellers,
    expandedSeller,
    onToggleExpand,
    onUpdateStatus,
    onUpdateVerified
}: SellersTableProps) {
    const router = useRouter();

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
            inactive: 'bg-gray-50 text-gray-700 ring-gray-600/20',
            suspended: 'bg-red-50 text-red-700 ring-red-600/20',
        };
        const style = styles[status as keyof typeof styles] || styles.inactive;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${style}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'active' ? 'bg-emerald-600' :
                        status === 'pending' ? 'bg-amber-600' :
                            status === 'suspended' ? 'bg-red-600' : 'bg-gray-500'
                    }`} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (sellers.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No sellers found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            <th className="w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sellers.map((seller) => (
                            <React.Fragment key={seller._id}>
                                <tr className={`hover:bg-gray-50/80 transition-colors ${expandedSeller === seller._id ? 'bg-gray-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                {seller.businessName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{seller.businessName}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                    <span className="capitalize">{seller.businessType || 'Retail'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center text-xs text-gray-600 hover:text-gray-900 transition-colors">
                                                <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                {seller.email}
                                            </div>
                                            {seller.phone && (
                                                <div className="flex items-center text-xs text-gray-600">
                                                    <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                    {seller.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        {getStatusBadge(seller.status)}
                                    </td>

                                    <td className="px-6 py-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateVerified(seller._id, !seller.verified);
                                            }}
                                            className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${seller.verified
                                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-600/20'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 ring-1 ring-gray-600/10'
                                                }`}
                                        >
                                            {seller.verified ? (
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                            ) : (
                                                <Shield className="w-3.5 h-3.5" />
                                            )}
                                            {seller.verified ? 'Verified' : 'Unverified'}
                                        </button>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {formatDate(seller.createdAt)}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {seller.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onUpdateStatus(seller._id, 'active');
                                                        }}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onUpdateStatus(seller._id, 'suspended');
                                                        }}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            {seller.status === 'active' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdateStatus(seller._id, 'suspended');
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-colors"
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                            {seller.status === 'suspended' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdateStatus(seller._id, 'active');
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 border border-green-200 rounded-md transition-colors"
                                                >
                                                    Reactivate
                                                </button>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onToggleExpand(seller._id)}
                                            className={`p-1.5 rounded-md transition-colors ${expandedSeller === seller._id
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {expandedSeller === seller._id ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </button>
                                    </td>
                                </tr>

                                {/* Expanded Detail Cards */}
                                {expandedSeller === seller._id && (
                                    <tr>
                                        <td colSpan={7} className="px-0 py-0">
                                            <div className="bg-gray-50/50 border-t border-b border-gray-100 p-6 animate-in slide-in-from-top-2 duration-200">
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                                    {/* Card 1: Business Details */}
                                                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                                                            <Store className="w-4 h-4 text-gray-500" />
                                                            Business Information
                                                        </h4>
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-500">Legal Name</span>
                                                                <span className="font-medium text-gray-900">{seller.businessName}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-500">GST Number</span>
                                                                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                                                    {seller.gstNumber || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="pt-2">
                                                                <span className="text-xs text-gray-500 block mb-1">Registered Address</span>
                                                                <div className="text-sm text-gray-900 flex items-start gap-2 bg-gray-50 p-2 rounded-md">
                                                                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                    <span>{seller.address || 'No address provided'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card 2: Performance & Metrics */}
                                                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                                                            <TrendingUp className="w-4 h-4 text-gray-500" />
                                                            Performance Overview
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                                            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                                                                <div className="text-xs text-orange-600 mb-1 font-medium">Total Sales</div>
                                                                <div className="text-lg font-bold text-orange-900">{seller.totalSales || 0}</div>
                                                            </div>
                                                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                                <div className="text-xs text-blue-600 mb-1 font-medium">Revenue</div>
                                                                <div className="text-lg font-bold text-blue-900">
                                                                    {formatCurrency(seller.revenue || 0)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex justify-between text-sm items-center">
                                                                <span className="text-gray-500">Commission Rate</span>
                                                                <span className="font-semibold text-gray-900">{seller.commission || 0}%</span>
                                                            </div>
                                                            {/* Add more metrics here if available */}
                                                        </div>
                                                    </div>

                                                    {/* Card 3: Quick Actions */}
                                                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                                                            Actions
                                                        </h4>
                                                        <div className="space-y-3">
                                                            <button
                                                                onClick={() => router.push(`/admin/products?seller=${seller._id}`)}
                                                                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group/btn"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover/btn:bg-indigo-100 transition-colors">
                                                                        <Package className="w-4 h-4 text-indigo-600" />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <div className="text-sm font-medium text-gray-900">View Products</div>
                                                                        <div className="text-xs text-gray-500">{seller.totalProducts || 0} products listed</div>
                                                                    </div>
                                                                </div>
                                                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                                            </button>

                                                            <a
                                                                href={`mailto:${seller.email}`}
                                                                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group/btn"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center group-hover/btn:bg-green-100 transition-colors">
                                                                        <Mail className="w-4 h-4 text-green-600" />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <div className="text-sm font-medium text-gray-900">Contact Seller</div>
                                                                        <div className="text-xs text-gray-500">Send email to registered address</div>
                                                                    </div>
                                                                </div>
                                                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                                            </a>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
