import { CheckCircle, Package, Truck, XCircle } from 'lucide-react';
import { SellerOrder, SellerOrderStatus } from '@/types/seller/orders';

interface BulkActionsHeaderProps {
  selectedOrders: SellerOrder[];
  onBulkStatusUpdate: (status: SellerOrderStatus) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isUpdating: boolean;
}

export function BulkActionsHeader({
  selectedOrders,
  onBulkStatusUpdate,
  onSelectAll,
  onClearSelection,
  isUpdating
}: BulkActionsHeaderProps) {
  if (selectedOrders.length === 0) return null;

  // Count orders by status
  const pendingCount = selectedOrders.filter(o => o.orderStatus === 'pending').length;
  const confirmedCount = selectedOrders.filter(o => o.orderStatus === 'confirmed').length;
  const processingCount = selectedOrders.filter(o => o.orderStatus === 'processing').length;
  const shippedCount = selectedOrders.filter(o => o.orderStatus === 'shipped').length;

  // Determine which actions are applicable
  const canConfirm = pendingCount > 0;
  const canProcess = confirmedCount > 0;
  const canShip = processingCount > 0;
  const canCancel = selectedOrders.some(o => 
    ['pending', 'confirmed'].includes(o.orderStatus)
  );

  const actions = [
    {
      show: canConfirm,
      label: `Confirm (${pendingCount})`,
      status: 'confirmed' as SellerOrderStatus,
      icon: CheckCircle,
      className: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      show: canProcess,
      label: `Process (${confirmedCount})`,
      status: 'processing' as SellerOrderStatus,
      icon: Package,
      className: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      show: canShip,
      label: `Ship (${processingCount})`,
      status: 'shipped' as SellerOrderStatus,
      icon: Truck,
      className: 'bg-violet-600 hover:bg-violet-700'
    },
    {
      show: canCancel,
      label: `Cancel (${selectedOrders.filter(o => ['pending', 'confirmed'].includes(o.orderStatus)).length})`,
      status: 'cancelled' as SellerOrderStatus,
      icon: XCircle,
      className: 'bg-red-600 hover:bg-red-700'
    }
  ].filter(action => action.show);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 font-medium">
          {selectedOrders.length} order(s) selected
        </span>
        <div className="flex items-center gap-3">
          {actions.map((action) => (
            <button
              key={action.status}
              onClick={() => onBulkStatusUpdate(action.status)}
              disabled={isUpdating}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 text-sm font-medium flex items-center gap-2 ${action.className}`}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </button>
          ))}
          <button
            onClick={onSelectAll}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Select All
          </button>
          <button
            onClick={onClearSelection}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
