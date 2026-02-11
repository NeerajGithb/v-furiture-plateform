import React from 'react';
import {
  Clock, CheckCircle, XCircle, Package, Truck,
  ChevronDown, ChevronUp, MapPin, CreditCard
} from 'lucide-react';
import { OrdersTableProps } from '@/types/admin/orders';
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
              <React.Fragment key={order.id}>
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
                      onClick={() => onToggleExpand(order.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-900"
                    >
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedOrder === order.id && (
                  <tr>
                    <td colSpan={7} className="px-0 py-0 bg-gray-50 border-b border-gray-200">
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-500" />
                                Order Details
                              </h3>
                              <div className="space-y-3">
                                {order.items?.map((item: any, index: number) => (
                                  <div key={`${order.id}-item-${index}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    {item.productId?.mainImage?.url ? (
                                      <img
                                        src={item.productId.mainImage.url}
                                        alt={item.productId.mainImage.alt || item.productId.name}
                                        className="w-16 h-16 object-cover rounded bg-white border border-gray-200 flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                        <Package className="w-8 h-8 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.productId?.name || 'Unknown Product'}
                                      </p>
                                      <div className="mt-1 space-y-0.5">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <span>SKU: {item.productId?.sku || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <span>Seller: {item.sellerId?.businessName || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <span>Qty: {item.quantity}</span>
                                          <span className="text-gray-300">|</span>
                                          <span>Price: {formatCurrency(item.price || 0)}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-sm font-semibold text-gray-900">
                                        {formatCurrency((item.price || 0) * (item.quantity || 0))}
                                      </p>
                                    </div>
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
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                                    <p>{order.shippingAddress?.country}</p>
                                  </div>
                                </div>
                              </div>
                              {order.trackingNumber && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Tracking Number</p>
                                  <p className="font-mono text-sm font-medium text-blue-600">{order.trackingNumber}</p>
                                </div>
                              )}
                            </div>

                            {order.notes && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Order Notes</h3>
                                <p className="text-sm text-gray-600">{order.notes}</p>
                              </div>
                            )}
                          </div>

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
                              <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Info</h3>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <p className="text-xs text-gray-500">Name</p>
                                  <p className="font-medium text-gray-900">{order.userId?.name || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Email</p>
                                  <p className="text-gray-900">{order.userId?.email || 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h3 className="text-sm font-medium text-gray-900 mb-3">Order Timeline</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Created</span>
                                  <span className="text-gray-900">{new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Last Updated</span>
                                  <span className="text-gray-900">{new Date(order.updatedAt).toLocaleString()}</span>
                                </div>
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