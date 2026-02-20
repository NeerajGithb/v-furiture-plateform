'use client';

import { useState } from 'react';
import {
  ShoppingCart, Clock, Package, Truck, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Eye, Calendar, User, MapPin,
  Phone, Mail, Edit3, Save, X
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { SellerOrder, SellerOrderStatus, OrdersListProps } from '@/types/seller/orders';
import { useNavigate } from '@/components/NavigationLoader';

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  pending: { label: 'Pending', dot: 'bg-amber-400', text: 'text-amber-700' },
  confirmed: { label: 'Confirmed', dot: 'bg-blue-400', text: 'text-blue-700' },
  processing: { label: 'Processing', dot: 'bg-indigo-400', text: 'text-indigo-700' },
  shipped: { label: 'Shipped', dot: 'bg-violet-400', text: 'text-violet-700' },
  delivered: { label: 'Delivered', dot: 'bg-emerald-400', text: 'text-emerald-700' },
  cancelled: { label: 'Cancelled', dot: 'bg-rose-400', text: 'text-rose-600' },
  returned: { label: 'Returned', dot: 'bg-[#9CA3AF]', text: 'text-[#6B7280]' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F8F9FA] border border-[#E5E7EB] text-[11px] font-semibold capitalize">
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className={cfg.text}>{cfg.label}</span>
    </span>
  );
}

function getStatusActions(order: SellerOrder) {
  const actions = [];
  if (order.orderStatus === 'pending')
    actions.push({ label: 'Confirm Order', status: 'confirmed' as SellerOrderStatus, icon: CheckCircle });
  if (order.orderStatus === 'confirmed')
    actions.push({ label: 'Start Processing', status: 'processing' as SellerOrderStatus, icon: Package });
  if (order.orderStatus === 'processing')
    actions.push({ label: 'Mark as Shipped', status: 'shipped' as SellerOrderStatus, icon: Truck, requiresTracking: true });
  if (order.orderStatus === 'shipped')
    actions.push({ label: 'Mark as Delivered', status: 'delivered' as SellerOrderStatus, icon: CheckCircle });
  return actions;
}

export default function OrdersList({
  orders,
  selectedOrders,
  onToggleOrderSelection,
  onStatusChange,
  updateOrderStatus,
}: OrdersListProps) {
  const router = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrackingSave = (orderId: string, status: SellerOrderStatus) => {
    if (trackingNumber.trim()) onStatusChange(orderId, status, trackingNumber.trim());
    setEditingTracking(null);
    setTrackingNumber('');
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[auto_1fr_140px_160px_120px_80px] gap-4 items-center px-4 py-2.5 bg-[#F8F9FA] border-b border-[#E5E7EB]">
        <div className="w-4" />
        <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Order</span>
        <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Status</span>
        <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Customer</span>
        <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest text-right">Amount</span>
        <div />
      </div>

      <div className="divide-y divide-[#F3F4F6]">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id;
          const isSelected = selectedOrders.includes(order.id);
          const actions = getStatusActions(order);

          return (
            <div key={order.id} className={isSelected ? 'bg-[#F8F9FA]' : ''}>
              {/* Row */}
              <div
                className="grid grid-cols-[auto_1fr_140px_160px_120px_80px] gap-4 items-center px-4 py-3.5 hover:bg-[#F8F9FA] transition-colors duration-100 cursor-pointer"
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              >
                {/* Checkbox */}
                <div onClick={e => { e.stopPropagation(); onToggleOrderSelection(order.id); }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => { }}
                    className="w-3.5 h-3.5 border-[#D1D5DB] rounded accent-[#111111] cursor-pointer"
                  />
                </div>

                {/* Order # + date */}
                <div>
                  <p className="text-[13px] font-semibold text-[#111111] font-mono">
                    #{order.orderNumber.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={order.orderStatus} />
                </div>

                {/* Customer */}
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#374151] truncate">
                    {order.userId?.name || order.customerName || 'Guest'}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF]">{order.items?.length || 0} items</p>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[#111111] tabular-nums">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  {order.trackingNumber && (
                    <p className="text-[10px] text-[#9CA3AF] font-mono mt-0.5 truncate">
                      {order.trackingNumber}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); router.push(`/seller/orders/${order.id}`); }}
                    aria-label="View order details"
                    className="p-1.5 rounded-md text-[#9CA3AF] hover:text-[#111111] hover:bg-[#F3F4F6] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    className="p-1.5 rounded-md text-[#9CA3AF] hover:text-[#111111] hover:bg-[#F3F4F6] transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expanded section */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-1 bg-[#FAFAFA] border-t border-[#F3F4F6]">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-3">
                      <div className="bg-white border border-[#E5E7EB] rounded-lg">
                        <div className="px-4 py-3 border-b border-[#F3F4F6]">
                          <h4 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
                            Items ({order.items?.length || 0})
                          </h4>
                        </div>
                        <div className="divide-y divide-[#F9FAFB]">
                          {order.items?.map((item: any) => (
                            <div key={item.id || item.productId} className="flex items-center gap-3 px-4 py-3">
                              <div className="w-9 h-9 bg-[#F3F4F6] border border-[#E5E7EB] rounded-md flex-shrink-0 overflow-hidden">
                                {item.productId?.mainImage?.url ? (
                                  <img src={item.productId.mainImage.url} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-4 h-4 text-[#9CA3AF]" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-[#111111] truncate">{item.name}</p>
                                <p className="text-[11px] text-[#9CA3AF]">
                                  {item.quantity} × {formatCurrency(item.price)}
                                </p>
                              </div>
                              <span className="text-[13px] font-semibold text-[#111111] tabular-nums">
                                {formatCurrency(item.quantity * item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {/* Totals */}
                        <div className="px-4 py-3 border-t border-[#F3F4F6] space-y-1.5">
                          {[
                            { label: 'Subtotal', value: formatCurrency(order.subtotal), show: true },
                            { label: 'Shipping', value: formatCurrency(order.shippingCost), show: order.shippingCost > 0 },
                            { label: 'Tax', value: formatCurrency(order.tax), show: order.tax > 0 },
                            { label: 'Discount', value: `-${formatCurrency(order.discount)}`, show: order.discount > 0, emerald: true },
                          ].filter(r => r.show).map(row => (
                            <div key={row.label} className="flex justify-between text-[12px]">
                              <span className="text-[#9CA3AF]">{row.label}</span>
                              <span className={row.emerald ? 'text-emerald-600 font-medium' : 'text-[#374151]'}>{row.value}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-[13px] font-bold pt-2 border-t border-[#F3F4F6]">
                            <span className="text-[#111111]">Total</span>
                            <span className="text-[#111111] tabular-nums">{formatCurrency(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping info */}
                      <div className="bg-white border border-[#E5E7EB] rounded-lg">
                        <div className="px-4 py-3 border-b border-[#F3F4F6]">
                          <h4 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> Shipping
                          </h4>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
                          <div>
                            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-widest mb-1.5">Customer</p>
                            <p className="font-semibold text-[#111111]">{order.userId?.name || order.customerName}</p>
                            <p className="text-[#6B7280] flex items-center gap-1 mt-1"><Mail className="w-3 h-3" />{order.userId?.email || order.customerEmail}</p>
                            <p className="text-[#6B7280] flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{order.shippingAddress?.phone || order.customerPhone}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-widest mb-1.5">Delivery Address</p>
                            <p className="text-[#374151] leading-relaxed">
                              {order.shippingAddress?.fullName}<br />
                              {order.shippingAddress?.addressLine1}<br />
                              {order.shippingAddress?.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="space-y-3">
                      <div className="bg-white border border-[#E5E7EB] rounded-lg">
                        <div className="px-4 py-3 border-b border-[#F3F4F6]">
                          <h4 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Order Actions</h4>
                        </div>
                        <div className="px-4 py-3 space-y-2.5">
                          {actions.map((action) => (
                            <div key={action.status}>
                              {action.requiresTracking && editingTracking === order.id ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={e => setTrackingNumber(e.target.value)}
                                    placeholder="Tracking number"
                                    className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent bg-white"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleTrackingSave(order.id, action.status)}
                                      disabled={updateOrderStatus.isPending || !trackingNumber.trim()}
                                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white text-[12px] font-medium rounded-md hover:bg-[#222222] disabled:opacity-40 transition-colors"
                                    >
                                      <Save className="w-3.5 h-3.5" /> Save & Ship
                                    </button>
                                    <button
                                      onClick={() => { setEditingTracking(null); setTrackingNumber(''); }}
                                      className="p-1.5 border border-[#E5E7EB] rounded-md text-[#6B7280] hover:bg-[#F8F9FA] transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (action.requiresTracking) {
                                      setEditingTracking(order.id);
                                      setTrackingNumber(order.trackingNumber || '');
                                    } else {
                                      onStatusChange(order.id, action.status);
                                    }
                                  }}
                                  disabled={updateOrderStatus.isPending}
                                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#111111] text-white text-[12px] font-medium rounded-md hover:bg-[#222222] disabled:opacity-40 transition-colors"
                                >
                                  <action.icon className="w-3.5 h-3.5" />
                                  {updateOrderStatus.isPending ? 'Updating…' : action.label}
                                </button>
                              )}
                            </div>
                          ))}

                          {order.trackingNumber && (
                            <div className="pt-2 border-t border-[#F3F4F6]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] text-[#9CA3AF] uppercase tracking-widest">Tracking</span>
                                <button
                                  onClick={() => { setEditingTracking(order.id); setTrackingNumber(order.trackingNumber || ''); }}
                                  className="text-[11px] text-[#6B7280] hover:text-[#111111] flex items-center gap-1 transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" /> Edit
                                </button>
                              </div>
                              <p className="text-[12px] font-mono bg-[#F8F9FA] border border-[#E5E7EB] px-2 py-1 rounded-md text-[#374151]">
                                {order.trackingNumber}
                              </p>
                            </div>
                          )}

                          <div className="pt-2 border-t border-[#F3F4F6] space-y-1.5">
                            <button
                              onClick={() => window.open(`/seller/orders/${order.id}/invoice`, '_blank')}
                              className="w-full px-3 py-2 text-[12px] font-medium text-[#555555] bg-white border border-[#E5E7EB] rounded-md hover:bg-[#F8F9FA] hover:text-[#111111] transition-all"
                            >
                              Download Invoice
                            </button>
                            <button
                              onClick={() => window.open(`mailto:${order.userId?.email || order.customerEmail}`, '_blank')}
                              className="w-full px-3 py-2 text-[12px] font-medium text-[#555555] bg-white border border-[#E5E7EB] rounded-md hover:bg-[#F8F9FA] hover:text-[#111111] transition-all"
                            >
                              Contact Customer
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Payment info */}
                      <div className="bg-white border border-[#E5E7EB] rounded-lg">
                        <div className="px-4 py-3 border-b border-[#F3F4F6]">
                          <h4 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Payment</h4>
                        </div>
                        <div className="px-4 py-3 space-y-2 text-[12px]">
                          {[
                            { label: 'Method', value: order.paymentMethod, capitalize: true },
                            {
                              label: 'Status',
                              value: order.paymentStatus,
                              color: order.paymentStatus === 'paid' ? 'text-emerald-600' : order.paymentStatus === 'pending' ? 'text-amber-600' : 'text-rose-600',
                              capitalize: true,
                            },
                            order.expectedDeliveryDate && {
                              label: 'Est. Delivery',
                              value: new Date(order.expectedDeliveryDate).toLocaleDateString(),
                            },
                          ].filter(Boolean).map((row: any) => (
                            <div key={row.label} className="flex justify-between">
                              <span className="text-[#9CA3AF]">{row.label}</span>
                              <span className={`font-medium text-[#374151] ${row.capitalize ? 'capitalize' : ''} ${row.color || ''}`}>
                                {row.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}