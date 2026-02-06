import React from 'react';
import {
  Clock, CheckCircle, XCircle, Package, Truck, RefreshCw,
  ChevronDown, ChevronUp, User, Phone, MapPin, CreditCard,
  Calendar, FileText, Eye, History
} from 'lucide-react';
import { OrdersTableProps } from '@/types/order';
import { formatCurrency } from '@/utils/currency';

export default function OrdersTable({
  orders,
  expandedOrder,
  onToggleExpand
}: OrdersTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
            <CheckCircle className="w-3 h-3" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10">
            <Truck className="w-3 h-3" />
            Shipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20">
            <Package className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
            Paid
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
            Failed
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
            Pending
          </span>
        );
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <p className="text-gray-900 font-medium">No orders found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Items</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <React.Fragment key={order._id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{order.shippingAddress?.fullName || 'N/A'}</span>
                      <span className="text-xs text-gray-500">{order.shippingAddress?.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(order.orderStatus)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {order.items?.length || 0} items
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onToggleExpand(order._id)}
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-900"
                    >
                      {expandedOrder === order._id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedOrder === order._id && (
                  <tr>
                    <td colSpan={7} className="px-0 py-0 bg-gray-50 border-b border-gray-200">
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Order Items */}
                          <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-500" />
                                Order Details
                              </h3>
                              <div className="space-y-3">
                                {order.items?.map((item, index: number) => (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    {item.productId?.mainImage?.url ? (
                                      <img
                                        src={item.productId.mainImage.url}
                                        alt={item.productId.mainImage.alt || item.productId.name}
                                        className="w-12 h-12 object-cover rounded bg-white border border-gray-200"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {item.productId?.name || 'Unknown Product'}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                        <span className="text-xs text-gray-300">|</span>
                                        <span className="text-xs text-gray-500">Seller: {item.sellerId?.businessName}</span>
                                      </div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {formatCurrency((item.price || 0) * (item.quantity || 0))}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                Shipping Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Recipient</p>
                                  <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
                                  <p className="text-gray-600">{order.shippingAddress?.phone}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Address</p>
                                  <div className="text-gray-900">
                                    <p>{order.shippingAddress?.addressLine1}</p>
                                    {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                                    <p>{order.shippingAddress?.country}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Sidebar */}
                          <div className="space-y-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-500" />
                                Payment Summary
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-1 border-b border-gray-100">
                                  <span className="text-gray-600">Method</span>
                                  <span className="font-medium uppercase">{order.paymentMethod}</span>
                                </div>
                                {order.priceBreakdown && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Subtotal</span>
                                      <span>{formatCurrency(order.priceBreakdown.subtotal || 0)}</span>
                                    </div>
                                    {order.priceBreakdown.couponDiscount && order.priceBreakdown.couponDiscount > 0 && (
                                      <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(order.priceBreakdown.couponDiscount || 0)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Shipping</span>
                                      <span>{formatCurrency(order.priceBreakdown.shipping || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Tax</span>
                                      <span>{formatCurrency(order.priceBreakdown.tax || 0)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 mt-1 border-t border-gray-100 font-semibold text-gray-900 text-base">
                                      <span>Total</span>
                                      <span>{formatCurrency(order.priceBreakdown.total || 0)}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h3 className="text-sm font-medium text-gray-900 mb-3">Actions</h3>
                              <div className="space-y-2">
                                <button className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  View Full Details
                                </button>
                                <button className="w-full px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                                  <History className="w-4 h-4" />
                                  View History
                                </button>
                              </div>
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