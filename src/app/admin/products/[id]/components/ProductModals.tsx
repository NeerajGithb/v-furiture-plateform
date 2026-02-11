import { useState } from 'react';
import type { AdminProduct } from '@/types/admin/products';

interface ProductModalsProps {
  product?: AdminProduct;
  isMutating: boolean;
  showRejectModal: boolean;
  showDeleteModal: boolean;
  onCloseRejectModal: () => void;
  onCloseDeleteModal: () => void;
  onReject: (reason: string) => void;
  onDelete: () => void;
}

export default function ProductModals({
  isMutating,
  showRejectModal,
  showDeleteModal,
  onCloseRejectModal,
  onCloseDeleteModal,
  onReject,
  onDelete
}: ProductModalsProps) {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason.trim());
      setRejectionReason('');
      onCloseRejectModal();
    }
  };

  return (
    <>
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Product</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this product:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-sm"
              disabled={isMutating}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={onCloseRejectModal}
                disabled={isMutating}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isMutating || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isMutating ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Product</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCloseDeleteModal}
                disabled={isMutating}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                disabled={isMutating}
                className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isMutating ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}