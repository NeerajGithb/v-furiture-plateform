import { useState } from 'react';
import { Calendar, Edit2, Save, X, CreditCard, Truck, ExternalLink, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { PaymentDeliveryInfoProps } from '@/types/sellerOrder';

export function PaymentDeliveryInfo({ order, isCancelled, updating, onSaveTracking }: PaymentDeliveryInfoProps) {
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');

  const handleSave = async () => {
    await onSaveTracking(trackingNumber.trim());
    setIsEditingTracking(false);
  };

  const handleCancel = () => {
    setIsEditingTracking(false);
    setTrackingNumber(order.trackingNumber || '');
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-emerald-600 bg-emerald-50';
      case 'pending':
        return 'text-amber-600 bg-amber-50';
      case 'failed':
        return 'text-rose-600 bg-rose-50';
      case 'refunded':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-gray-500" />
        Payment & Delivery
      </h3>
      
      <div className="space-y-6">
        {/* Payment Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">Payment Details</h4>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Payment Method</label>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900 capitalize">{order.paymentMethod.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 block mb-1">Payment Status</label>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                {getPaymentStatusIcon(order.paymentStatus)}
                <span className="capitalize">{order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">Delivery Details</h4>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 flex items-center gap-1">
                <Truck className="w-3 h-3" />
                Tracking Number
              </label>
              {!isEditingTracking && !isCancelled && order.orderStatus !== 'delivered' && (
                <button
                  onClick={() => setIsEditingTracking(true)}
                  className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium"
                >
                  <Edit2 className="w-3 h-3" />
                  {order.trackingNumber ? 'Edit' : 'Add'}
                </button>
              )}
            </div>
            
            {isEditingTracking ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g., 1Z999AA1234567890)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={updating || !trackingNumber.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-2 font-medium"
                  >
                    <Save className="w-3 h-3" />
                    {updating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-2"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {order.trackingNumber ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-mono text-sm font-medium text-gray-900">{order.trackingNumber}</span>
                    <button
                      onClick={() => window.open(`https://www.track24.net/service/${order.trackingNumber}`, '_blank')}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Track
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No tracking number added yet</p>
                )}
              </div>
            )}
          </div>

          {order.expectedDeliveryDate && (
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                <Calendar className="w-3 h-3" />
                Expected Delivery Date
              </label>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}

          {order.estimatedDelivery && (
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                <Clock className="w-3 h-3" />
                Estimated Delivery
              </label>
              <p className="text-sm font-medium text-gray-900">{order.estimatedDelivery}</p>
            </div>
          )}
        </div>

        {/* Additional Actions */}
        {order.trackingNumber && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => window.open(`https://www.track24.net/service/${order.trackingNumber}`, '_blank')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Track Package
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(order.trackingNumber || '')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
