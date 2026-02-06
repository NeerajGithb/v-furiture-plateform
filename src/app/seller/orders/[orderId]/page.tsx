'use client';

import { useState, use } from 'react';
import {
  useSellerOrder,
  useUpdateOrderStatus,
  useUpdateOrderTracking,
  useAddOrderNotes,
  useCancelOrder
} from '@/hooks/seller/useSellerOrders';
import { SellerOrderStatus } from '@/types/sellerOrder';

const Loader = ({ text = 'Loading...', fullScreen = false }) => {
  const containerClasses = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center min-h-[60vh]';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="animate-spin rounded-full border-b-2 h-12 w-12 border-blue-600 mx-auto"></div>
        {text && <p className="mt-4 text-gray-600">{text}</p>}
      </div>
    </div>
  );
};
import { OrderHeader } from './components/OrderHeader';
import { OrderProgressStepper } from './components/OrderProgressStepper';
import { OrderItems } from './components/OrderItems';
import { PriceBreakdown } from './components/PriceBreakdown';
import { OrderNotes } from './components/OrderNotes';
import { CustomerInfo } from './components/CustomerInfo';
import { ShippingAddress } from './components/ShippingAddress';
import { PaymentDeliveryInfo } from './components/PaymentDeliveryInfo';
import { CancelOrderModal } from './components/CancelOrderModal';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // React Query hooks
  const { data: order, isLoading, error, refetch } = useSellerOrder(orderId);
  const updateOrderStatus = useUpdateOrderStatus();
  const updateTracking = useUpdateOrderTracking();
  const updateNotes = useAddOrderNotes();
  const cancelOrder = useCancelOrder();

  // Handlers - hooks handle everything
  const handleStatusChange = (newStatus: SellerOrderStatus) => {
    updateOrderStatus.mutate({
      orderId,
      data: { 
        status: newStatus,
        notes: `Status updated to ${newStatus} on ${new Date().toLocaleString()}`
      }
    });
  };

  const handleSaveTracking = async (trackingNumber: string) => {
    updateTracking.mutate({
      orderId,
      data: { 
        trackingNumber: trackingNumber.trim(),
        estimatedDelivery: getEstimatedDelivery()
      }
    });
  };

  const handleSaveNotes = async (notes: string) => {
    updateNotes.mutate({
      orderId,
      data: { notes: notes.trim() }
    });
  };

  const handleCancelOrder = async (reason: string) => {
    cancelOrder.mutate({
      orderId,
      data: { 
        reason,
        notes: `Order cancelled: ${reason} on ${new Date().toLocaleString()}`
      }
    }, {
      onSuccess: () => {
        setShowCancelModal(false);
      }
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate.toISOString().split('T')[0];
  };

  const isUpdating = updateOrderStatus.isPending || updateTracking.isPending ||
    updateNotes.isPending || cancelOrder.isPending;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Order</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Unable to load order details. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Retrying...' : 'Retry'}
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader />
        </div>
      )}
      {!isLoading && order && (
        <div className="space-y-6 max-w-7xl mx-auto">
          <OrderHeader
            order={order}
            onStatusChange={handleStatusChange}
            onCancel={() => setShowCancelModal(true)}
            onBack={() => window.history.back()}
            onPrint={() => window.print()}
            updating={isUpdating}
          />

          <OrderProgressStepper currentStatus={order.orderStatus} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <OrderItems items={order.items} />
              <PriceBreakdown order={order} />
              <OrderNotes
                notes={order.notes || ''}
                isCancelled={order.orderStatus === 'cancelled'}
                onSave={handleSaveNotes}
                updating={updateNotes.isPending}
              />
            </div>

            <div className="space-y-6">
              <CustomerInfo
                customerName={order.userId?.name || order.customerName || 'Unknown Customer'}
                customerEmail={order.userId?.email || order.customerEmail || 'N/A'}
                customerPhone={order.shippingAddress?.phone || order.customerPhone || 'N/A'}
              />
              <ShippingAddress shippingAddress={order.shippingAddress} />
              <PaymentDeliveryInfo
                order={order}
                isCancelled={order.orderStatus === 'cancelled'}
                onSaveTracking={handleSaveTracking}
                updating={updateTracking.isPending}
              />
            </div>
          </div>

          {showCancelModal && (
            <CancelOrderModal
              onConfirm={handleCancelOrder}
              onCancel={() => setShowCancelModal(false)}
              updating={cancelOrder.isPending}
            />
          )}
        </div>
      )}
    </>
  );
}
