'use client';

import { useState, use } from 'react';
import {
  useSellerOrder,
  useUpdateOrderStatus,
  useUpdateOrderTracking,
  useAddOrderNotes,
  useCancelOrder
} from '@/hooks/seller/useSellerOrders';
import { SellerOrderStatus } from '@/types/seller/orders';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import PageHeader from '@/components/PageHeader';
import { OrderHeader } from './components/OrderHeader';
import { OrderProgressStepper } from './components/OrderProgressStepper';
import { OrderItems } from './components/OrderItems';
import { PriceBreakdown } from './components/PriceBreakdown';
import { OrderNotes } from './components/OrderNotes';
import { CustomerInfo } from './components/CustomerInfo';
import { ShippingAddress } from './components/ShippingAddress';
import { PaymentDeliveryInfo } from './components/PaymentDeliveryInfo';
import { CancelOrderModal } from './components/CancelOrderModal';

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: order, isPending, error, refetch, isFetching } = useSellerOrder(orderId);
  const updateOrderStatus = useUpdateOrderStatus();
  const updateTracking = useUpdateOrderTracking();
  const updateNotes = useAddOrderNotes();
  const cancelOrder = useCancelOrder();

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
        trackingNumber: trackingNumber.trim()
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
        reason
      }
    }, {
      onSuccess: () => {
        setShowCancelModal(false);
      }
    });
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    return deliveryDate.toISOString().split('T')[0];
  };

  const isUpdating = updateOrderStatus.isPending || updateTracking.isPending ||
    updateNotes.isPending || cancelOrder.isPending;

  return (
    <>
      <PageHeader
        title={`Order #${order?.orderNumber.slice(-6).toUpperCase() || '...'}`}
        description="View and manage order details"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <LoaderGuard 
        isLoading={isPending} 
        error={error}
      >
        {() => (
          <div className="space-y-6 max-w-7xl mx-auto">
            <OrderHeader
              order={order!}
              onStatusChange={handleStatusChange}
              onCancel={() => setShowCancelModal(true)}
              onBack={() => window.history.back()}
              onPrint={() => window.print()}
              updating={isUpdating}
            />

            <OrderProgressStepper currentStatus={order!.orderStatus} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <OrderItems items={order!.items} />
                <PriceBreakdown order={order!} />
                <OrderNotes
                  notes={order!.notes || ''}
                  isCancelled={order!.orderStatus === 'cancelled'}
                  onSave={handleSaveNotes}
                  updating={updateNotes.isPending}
                />
              </div>

              <div className="space-y-6">
                <CustomerInfo
                  customerName={order!.userId?.name || order!.customerName || 'Unknown Customer'}
                  customerEmail={order!.userId?.email || order!.customerEmail || 'N/A'}
                  customerPhone={order!.shippingAddress?.phone || order!.customerPhone || 'N/A'}
                />
                <ShippingAddress shippingAddress={order!.shippingAddress} />
                <PaymentDeliveryInfo
                  order={order!}
                  isCancelled={order!.orderStatus === 'cancelled'}
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
      </LoaderGuard>
    </>
  );
}
