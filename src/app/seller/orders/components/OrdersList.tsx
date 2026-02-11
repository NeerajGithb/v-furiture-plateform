'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { SellerOrder, SellerOrderStatus, OrdersListProps } from '@/types/seller/orders';
import { useNavigate } from '@/components/NavigationLoader';

export default function OrdersList({
  orders,
  selectedOrders,
  onToggleOrderSelection,
  onStatusChange,
  updateOrderStatus
}: OrdersListProps) {
  const router = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      confirmed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      processing: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
      shipped: 'bg-purple-50 text-purple-700 ring-purple-600/20',
      delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20',
      returned: 'bg-gray-50 text-gray-700 ring-gray-600/20',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20';
  };

  const getStatusIcon = (status: string) => {
    const icons: any = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
      returned: XCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-3.5 h-3.5" />;
  };

  const handleTrackingEdit = (orderId: string, currentTracking?: string) => {
    setEditingTracking(orderId);
    setTrackingNumber(currentTracking || '');
  };

  const handleTrackingSave = (orderId: string, status: SellerOrderStatus) => {
    if (trackingNumber.trim()) {
      onStatusChange(orderId, status, trackingNumber.trim());
    }
    setEditingTracking(null);
    setTrackingNumber('');
  };

  const handleTrackingCancel = () => {
    setEditingTracking(null);
    setTrackingNumber('');
  };

  const getNextStatus = (currentStatus: SellerOrderStatus): SellerOrderStatus | null => {
    const statusFlow: Record<SellerOrderStatus, SellerOrderStatus | null> = {
      pending: 'confirmed',
      confirmed: 'processing',
      processing: 'shipped',
      shipped: 'delivered',
      delivered: null,
      cancelled: null,
      returned: null,
    };
    return statusFlow[currentStatus];
  };

  const getStatusActions = (order: SellerOrder) => {
    const actions = [];
    const currentStatus = order.orderStatus;

    if (currentStatus === 'pending') {
      actions.push({
        label: 'Confirm Order',
        status: 'confirmed' as SellerOrderStatus,
        color: 'bg-blue-600 hover:bg-blue-700',
        icon: CheckCircle
      });
    }

    if (currentStatus === 'confirmed') {
      actions.push({
        label: 'Start Processing',
        status: 'processing' as SellerOrderStatus,
        color: 'bg-indigo-600 hover:bg-indigo-700',
        icon: Package
      });
    }

    if (currentStatus === 'processing') {
      actions.push({
        label: 'Mark as Shipped',
        status: 'shipped' as SellerOrderStatus,
        color: 'bg-purple-600 hover:bg-purple-700',
        icon: Truck,
        requiresTracking: true
      });
    }

    if (currentStatus === 'shipped') {
      actions.push({
        label: 'Mark as Delivered',
        status: 'delivered' as SellerOrderStatus,
        color: 'bg-emerald-600 hover:bg-emerald-700',
        icon: CheckCircle
      });
    }

    return actions;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
          <div key={order.id} className="group">
            {/* Order Header */}
            <div
              className={`p-4 cursor-pointer transition-colors ${expandedOrder === order.id ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center p-1 rounded hover:bg-gray-200 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleOrderSelection(order.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => { }}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
                    />
                  </div>

                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">#{order.orderNumber.slice(-6).toUpperCase()}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="capitalize">{order.orderStatus}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 p-1.5 rounded-full">
                        <User className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{order.userId?.name || order.customerName || 'Guest'}</span>
                        <span className="text-xs text-gray-500">{order.items?.length || 0} items</span>
                      </div>
                    </div>

                    <div className="text-right pr-4">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      {order.trackingNumber && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tracking: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/seller/orders/${order.id}`);
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-500 hover:text-gray-900"
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-400 hover:text-gray-600">
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Order Details */}
            {expandedOrder === order.id && (
              <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  {/* Order Items */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-lg p-5 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        Items Included ({order.items?.length || 0})
                      </h3>
                      <div className="space-y-4">
                        {order.items?.map((item: any) => (
                          <div key={item.id || item.productId} className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden border border-gray-200">
                              {item.productId?.mainImage?.url ? (
                                <img
                                  src={item.productId.mainImage.url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Qty: {item.quantity} × {formatCurrency(item.price)}
                              </p>
                              {item.selectedVariant && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Variant: {JSON.stringify(item.selectedVariant)}
                                </p>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.quantity * item.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.shippingCost > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Shipping</span>
                            <span className="text-gray-900">{formatCurrency(order.shippingCost)}</span>
                          </div>
                        )}
                        {order.tax > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Tax</span>
                            <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                          </div>
                        )}
                        {order.discount > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Discount</span>
                            <span className="text-emerald-600">-{formatCurrency(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-gray-100">
                          <span className="text-gray-900">Total Amount</span>
                          <span className="text-gray-900 text-lg">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer & Shipping Info */}
                    <div className="bg-white rounded-lg p-5 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        Shipping Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Customer</p>
                          <p className="font-medium text-gray-900">{order.userId?.name || order.customerName}</p>
                          <p className="text-gray-600 flex items-center gap-1.5 mt-1">
                            <Mail className="w-3 h-3" /> 
                            {order.userId?.email || order.customerEmail}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1.5 mt-1">
                            <Phone className="w-3 h-3" /> 
                            {order.shippingAddress?.phone || order.customerPhone}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
                          <p className="text-gray-700 leading-relaxed">
                            {order.shippingAddress?.fullName}<br />
                            {order.shippingAddress?.addressLine1}<br />
                            {order.shippingAddress?.addressLine2 && (
                              <>{order.shippingAddress.addressLine2}<br /></>
                            )}
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
                            {order.shippingAddress?.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-5 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Management</h3>
                      <div className="space-y-3">
                        {getStatusActions(order).map((action) => (
                          <div key={action.status}>
                            {action.requiresTracking && editingTracking === order.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={trackingNumber}
                                  onChange={(e) => setTrackingNumber(e.target.value)}
                                  placeholder="Enter tracking number"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleTrackingSave(order.id, action.status)}
                                    disabled={updateOrderStatus.isPending || !trackingNumber.trim()}
                                    className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    Save & Ship
                                  </button>
                                  <button
                                    onClick={handleTrackingCancel}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  if (action.requiresTracking) {
                                    handleTrackingEdit(order.id, order.trackingNumber);
                                  } else {
                                    onStatusChange(order.id, action.status);
                                  }
                                }}
                                disabled={updateOrderStatus.isPending}
                                className={`w-full px-4 py-2 text-white rounded-md transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 ${action.color}`}
                              >
                                <action.icon className="w-3.5 h-3.5" />
                                {updateOrderStatus.isPending ? 'Updating...' : action.label}
                              </button>
                            )}
                          </div>
                        ))}

                        {order.trackingNumber && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Tracking Number</span>
                              <button
                                onClick={() => handleTrackingEdit(order.id, order.trackingNumber)}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                Edit
                              </button>
                            </div>
                            <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                              {order.trackingNumber}
                            </p>
                          </div>
                        )}

                        <div className="pt-2 border-t border-gray-100 space-y-2">
                          <button 
                            onClick={() => window.open(`/seller/orders/${order.id}/invoice`, '_blank')}
                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            Download Invoice
                          </button>
                          <button 
                            onClick={() => window.open(`mailto:${order.userId?.email || order.customerEmail}`, '_blank')}
                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            Contact Customer
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Payment & Delivery Info */}
                    <div className="bg-white rounded-lg p-5 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment & Delivery</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Method</span>
                          <span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Status</span>
                          <span className={`font-medium capitalize ${
                            order.paymentStatus === 'paid' ? 'text-emerald-600' :
                            order.paymentStatus === 'pending' ? 'text-amber-600' :
                            'text-rose-600'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        {order.expectedDeliveryDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Expected Delivery</span>
                            <span className="font-medium text-gray-900">
                              {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {order.notes && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-gray-700 text-sm">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}