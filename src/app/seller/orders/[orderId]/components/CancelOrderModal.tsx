import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { CancelOrderModalProps } from '@/types/seller/orders';

export function CancelOrderModal({ updating, onConfirm, onCancel }: CancelOrderModalProps) {
  const [cancelReason, setCancelReason] = useState('');

  const handleConfirm = () => {
    onConfirm(cancelReason);
    setCancelReason('');
  };

  const handleClose = () => {
    setCancelReason('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
            <p className="text-sm text-gray-600">This action cannot be undone</p>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cancellation Reason *
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancellation..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={updating || !cancelReason.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            {updating ? 'Cancelling...' : 'Cancel Order'}
          </button>
          <button
            onClick={handleClose}
            disabled={updating}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
