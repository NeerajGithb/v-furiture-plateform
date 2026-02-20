import { CheckCircle, Package, Truck, XCircle, X } from 'lucide-react';
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
  isUpdating,
}: BulkActionsHeaderProps) {
  if (selectedOrders.length === 0) return null;

  const pendingCount = selectedOrders.filter(o => o.orderStatus === 'pending').length;
  const confirmedCount = selectedOrders.filter(o => o.orderStatus === 'confirmed').length;
  const processingCount = selectedOrders.filter(o => o.orderStatus === 'processing').length;
  const cancellableCount = selectedOrders.filter(o =>
    ['pending', 'confirmed'].includes(o.orderStatus)
  ).length;

  const actions = [
    {
      show: pendingCount > 0,
      label: `Confirm (${pendingCount})`,
      status: 'confirmed' as SellerOrderStatus,
      icon: CheckCircle,
    },
    {
      show: confirmedCount > 0,
      label: `Process (${confirmedCount})`,
      status: 'processing' as SellerOrderStatus,
      icon: Package,
    },
    {
      show: processingCount > 0,
      label: `Ship (${processingCount})`,
      status: 'shipped' as SellerOrderStatus,
      icon: Truck,
    },
    {
      show: cancellableCount > 0,
      label: `Cancel (${cancellableCount})`,
      status: 'cancelled' as SellerOrderStatus,
      icon: XCircle,
      danger: true,
    },
  ].filter(a => a.show);

  return (
    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg px-4 py-3 flex items-center justify-between">
      <span className="text-[12px] font-semibold text-[#374151]">
        {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
      </span>

      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.status}
            onClick={() => onBulkStatusUpdate(action.status)}
            disabled={isUpdating}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md
              border transition-all duration-150 disabled:opacity-40
              ${action.danger
                ? 'border-[#FECACA] bg-white text-rose-600 hover:bg-rose-50'
                : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6] hover:text-[#111111]'
              }
            `}
          >
            <action.icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        ))}

        <div className="w-px h-4 bg-[#E5E7EB] mx-1" />

        <button
          onClick={onSelectAll}
          className="px-3 py-1.5 text-[12px] font-medium text-[#555555] border border-[#E5E7EB] bg-white rounded-md hover:bg-[#F8F9FA] transition-all"
        >
          Select All
        </button>
        <button
          onClick={onClearSelection}
          aria-label="Clear selection"
          className="p-1.5 text-[#9CA3AF] hover:text-[#374151] border border-[#E5E7EB] bg-white rounded-md hover:bg-[#F8F9FA] transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
