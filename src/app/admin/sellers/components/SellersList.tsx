import React, { useEffect } from "react";
import { 
  Store, 
  Mail, 
  Phone, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  TrendingUp, 
  Star, 
  User 
} from "lucide-react";
import type { AdminSeller, SellerStatus } from "@/types/admin/sellers";
import { formatCurrency } from "@/utils/currency";
import { useSellersUIStore } from "@/stores/admin/sellersStore";

interface SellersListProps {
  sellers: AdminSeller[];
  onStatusChange: (sellerId: string, status: SellerStatus, reason?: string) => void;
  onVerificationChange: (sellerId: string, verified: boolean) => void;
  isUpdating?: boolean;
}

export default function SellersList({ 
  sellers, 
  onStatusChange, 
  onVerificationChange,
  isUpdating 
}: SellersListProps) {
  const expandedSellerId = useSellersUIStore(s => s.expandedSellerId);
  const setExpandedSellerId = useSellersUIStore(s => s.setExpandedSellerId);

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleSellerExpand = (sellerId: string) => {
    setExpandedSellerId(expandedSellerId === sellerId ? null : sellerId);
  };

  useEffect(() => {
    setExpandedSellerId(null);
  }, [sellers, setExpandedSellerId]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Business
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Verified
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Registered
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Actions
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider w-10">
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sellers.map((seller) => (
              <React.Fragment key={seller.id}>
                <tr className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-900 rounded-md flex items-center justify-center text-white font-medium text-sm">
                        {seller.businessName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{seller.businessName}</div>
                        <div className="text-xs text-gray-500">{seller.contactPerson}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <Mail className="w-3 h-3 mr-1.5 text-gray-400" />
                        {seller.email}
                      </div>
                      {seller.phone && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="w-3 h-3 mr-1.5 text-gray-400" />
                          {seller.phone}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset capitalize ${
                      seller.status === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                      seller.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                      seller.status === 'suspended' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                      'bg-gray-50 text-gray-700 ring-gray-600/20'
                    }`}>
                      {seller.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {seller.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md ring-1 ring-inset ring-green-600/20">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md ring-1 ring-inset ring-gray-500/20">
                        <div className="w-2 h-2 rounded-full border border-gray-400" /> Unverified
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDate(seller.createdAt)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {seller.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onStatusChange(seller.id, 'active')}
                            disabled={isUpdating}
                            className="text-xs font-medium bg-gray-900 text-white px-2.5 py-1.5 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onStatusChange(seller.id, 'suspended')}
                            disabled={isUpdating}
                            className="text-xs font-medium border border-gray-300 text-gray-700 bg-white px-2.5 py-1.5 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {seller.status === 'active' && (
                        <button
                          onClick={() => onStatusChange(seller.id, 'suspended')}
                          disabled={isUpdating}
                          className="text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}
                      {seller.status === 'suspended' && (
                        <button
                          onClick={() => onStatusChange(seller.id, 'active')}
                          disabled={isUpdating}
                          className="text-xs font-medium text-green-600 hover:text-green-800 hover:bg-green-50 px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => onVerificationChange(seller.id, !seller.verified)}
                        disabled={isUpdating}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors border border-gray-200 disabled:opacity-50 ${
                          seller.verified ? 'text-gray-600 hover:bg-gray-50' : 'text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {seller.verified ? 'Unverify' : 'Verify'}
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleSellerExpand(seller.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600"
                    >
                      {expandedSellerId === seller.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>

                {expandedSellerId === seller.id && (
                  <tr>
                    <td colSpan={7} className="px-0 py-0 bg-gray-50/50">
                      <div className="p-4 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                            <Store className="w-4 h-4 text-gray-500" />
                            Business Details
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <span className="text-gray-500">Business Name:</span>
                              <span className="font-medium text-gray-900">{seller.businessName}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <span className="text-gray-500">Contact:</span>
                              <span className="font-medium text-gray-900">{seller.contactPerson}</span>
                            </div>
                            {seller.businessType && (
                              <div className="grid grid-cols-2 gap-2">
                                <span className="text-gray-500">Type:</span>
                                <span className="font-medium text-gray-900 capitalize">{seller.businessType}</span>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <span className="text-gray-500">Email:</span>
                              <span className="font-medium text-gray-900 truncate">{seller.email}</span>
                            </div>
                            {seller.phone && (
                              <div className="grid grid-cols-2 gap-2">
                                <span className="text-gray-500">Phone:</span>
                                <span className="font-medium text-gray-900">{seller.phone}</span>
                              </div>
                            )}
                            {seller.gstNumber && (
                              <div className="grid grid-cols-2 gap-2">
                                <span className="text-gray-500">GST:</span>
                                <span className="font-mono text-gray-900 text-xs">{seller.gstNumber}</span>
                              </div>
                            )}
                            {seller.address && (
                              <div className="col-span-2 pt-2 border-t border-gray-100 mt-2">
                                <span className="text-gray-500 block mb-1">Address:</span>
                                <span className="font-medium text-gray-900">{seller.address}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-500" />
                            Account Status
                          </h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Status:</span>
                              <span className={`capitalize font-medium ${
                                seller.status === 'active' ? 'text-green-700' :
                                seller.status === 'suspended' ? 'text-red-700' :
                                'text-gray-700'
                              }`}>{seller.status}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Verified:</span>
                              <span className={`font-medium ${seller.verified ? 'text-green-700' : 'text-gray-500'}`}>
                                {seller.verified ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Commission:</span>
                              <span className="font-medium text-gray-900">{seller.commission || 0}%</span>
                            </div>
                            {seller.rating !== undefined && seller.rating > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">Rating:</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  <span className="font-medium text-gray-900">{seller.rating.toFixed(1)}</span>
                                </div>
                              </div>
                            )}
                            <div className="pt-2 border-t border-gray-100 mt-2 grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-500 mb-0.5">Registered</div>
                                <div className="font-medium text-gray-900">{formatDate(seller.createdAt)}</div>
                              </div>
                              {seller.lastLogin && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-0.5">Last Login</div>
                                  <div className="font-medium text-gray-900">{formatDate(seller.lastLogin)}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            Performance
                          </h3>
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="p-2 bg-gray-50 rounded border border-gray-100 text-center">
                                <div className="text-xs text-gray-500 mb-1">Products</div>
                                <div className="font-bold text-gray-900">{seller.totalProducts || 0}</div>
                              </div>
                              <div className="p-2 bg-gray-50 rounded border border-gray-100 text-center">
                                <div className="text-xs text-gray-500 mb-1">Sales</div>
                                <div className="font-bold text-gray-900">{seller.totalSales || 0}</div>
                              </div>
                              <div className="p-2 bg-gray-50 rounded border border-gray-100 text-center">
                                <div className="text-xs text-gray-500 mb-1">Revenue</div>
                                <div className="font-bold text-gray-900 text-xs sm:text-sm">
                                  {formatCurrency(seller.revenue || 0)}
                                </div>
                              </div>
                            </div>

                            {(seller.revenue || 0) > 0 && (
                              <div className="pt-2 border-t border-gray-100">
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                  <span className="text-xs text-gray-500">Platform Commission</span>
                                  <span className="font-semibold text-gray-900 text-sm">
                                    {formatCurrency((seller.revenue || 0) * ((seller.commission || 0) / 100))}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="pt-3 flex flex-wrap gap-2">
                              <button
                                onClick={() => window.location.href = `/admin/products?seller=${seller.id}`}
                                className="flex-1 px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
                              >
                                <Package className="w-3.5 h-3.5" />
                                Products
                              </button>
                              <button
                                onClick={() => window.location.href = `mailto:${seller.email}`}
                                className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 bg-white rounded hover:bg-gray-50 transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                Email
                              </button>
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