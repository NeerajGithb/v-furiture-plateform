import { ArrowLeft, CheckCircle, Clock, Package, Truck, XCircle, Printer, Download, Mail, Phone, Copy, ExternalLink } from 'lucide-react';
import { OrderHeaderProps, SellerOrderStatus } from '@/types/sellerOrder';
import { formatCurrency } from '@/utils/currency';
import { useState } from 'react';

export function OrderHeader({ order, updating, onBack, onStatusChange, onPrint, onCancel }: OrderHeaderProps) {
  const [copied, setCopied] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
      confirmed: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
      processing: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20',
      shipped: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20',
      delivered: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
      cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
      returned: 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20';
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
    return <Icon className="w-5 h-5" />;
  };

  const copyOrderNumber = async () => {
    await navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';
  const isDelivered = order.orderStatus === 'delivered';
  const isReturned = order.orderStatus === 'returned';

  const getNextStatusAction = () => {
    switch (order.orderStatus) {
      case 'pending':
        return { status: 'confirmed' as SellerOrderStatus, label: 'Confirm Order', color: 'bg-blue-600 hover:bg-blue-700', icon: CheckCircle };
      case 'confirmed':
        return { status: 'processing' as SellerOrderStatus, label: 'Start Processing', color: 'bg-indigo-600 hover:bg-indigo-700', icon: Package };
      case 'processing':
        return { status: 'shipped' as SellerOrderStatus, label: 'Mark as Shipped', color: 'bg-purple-600 hover:bg-purple-700', icon: Truck };
      case 'shipped':
        return { status: 'delivered' as SellerOrderStatus, label: 'Mark as Delivered', color: 'bg-emerald-600 hover:bg-emerald-700', icon: CheckCircle };
      default:
        return null;
    }
  };

  const nextAction = getNextStatusAction();

  return (
    <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6 print:shadow-none">
      <div className="flex items-start justify-between print:block">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors print:hidden mt-1"
            title="Back to Orders"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <button
                onClick={copyOrderNumber}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors print:hidden"
                title="Copy Order Number"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
              {copied && (
                <span className="text-xs text-emerald-600 font-medium">Copied!</span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Total Amount</p>
                <p className="font-bold text-gray-900 text-lg">{formatCurrency(order.totalAmount)}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment Status</p>
                <p className={`font-medium capitalize ${
                  order.paymentStatus === 'paid' ? 'text-emerald-600' :
                  order.paymentStatus === 'pending' ? 'text-amber-600' :
                  'text-rose-600'
                }`}>
                  {order.paymentStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 print:hidden">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
            {getStatusIcon(order.orderStatus)}
            <span className="capitalize">{order.orderStatus}</span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {!isCancelled && !isDelivered && !isReturned && (
        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            {nextAction && (
              <button
                onClick={() => onStatusChange(nextAction.status)}
                disabled={updating}
                className={`px-6 py-2.5 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 ${nextAction.color}`}
              >
                <nextAction.icon className="w-4 h-4" />
                {updating ? 'Updating...' : nextAction.label}
              </button>
            )}
            
            {canCancel && (
              <button
                onClick={onCancel}
                disabled={updating}
                className="px-6 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Cancel Order
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(`mailto:${order.userId?.email || order.customerEmail}`, '_blank')}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
              title="Email Customer"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            
            <button
              onClick={() => window.open(`tel:${order.shippingAddress?.phone || order.customerPhone}`, '_blank')}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
              title="Call Customer"
            >
              <Phone className="w-4 h-4" />
              Call
            </button>

            <button
              onClick={onPrint}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            <button
              onClick={() => window.open(`/seller/orders/${order._id}/invoice`, '_blank')}
              className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Invoice
            </button>
          </div>
        </div>
      )}

      {/* Tracking Information */}
      {order.trackingNumber && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tracking Number</p>
              <p className="font-mono text-sm font-medium text-gray-900">{order.trackingNumber}</p>
            </div>
            <button
              onClick={() => window.open(`https://track.example.com/${order.trackingNumber}`, '_blank')}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Track Package
            </button>
          </div>
        </div>
      )}

      {/* Expected Delivery */}
      {order.expectedDeliveryDate && (
        <div className="mt-2">
          <p className="text-sm text-gray-500">Expected Delivery</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      )}
    </div>
  );
}
