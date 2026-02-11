import { CheckCircle, XCircle, Eye, EyeOff, Trash2, X, Clock } from 'lucide-react';

interface BulkActionsHeaderProps {
  selectedCount: number;
  canApprove: number;
  canReject: number;
  canSetPending: number;
  canPublish: number;
  canUnpublish: number;
  onClearSelection: () => void;
  onBulkApprove: () => void;
  onBulkReject: () => void;
  onBulkSetPending: () => void;
  onBulkPublish: () => void;
  onBulkUnpublish: () => void;
  onBulkDelete: () => void;
}

export default function BulkActionsHeader({
  selectedCount,
  canApprove,
  canReject,
  canSetPending,
  canPublish,
  canUnpublish,
  onClearSelection,
  onBulkApprove,
  onBulkReject,
  onBulkSetPending,
  onBulkPublish,
  onBulkUnpublish,
  onBulkDelete
}: BulkActionsHeaderProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center gap-2">
          {canApprove > 0 && (
            <button
              onClick={onBulkApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              Approve ({canApprove})
            </button>
          )}
          {canReject > 0 && (
            <button
              onClick={onBulkReject}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <XCircle className="w-4 h-4" />
              Reject ({canReject})
            </button>
          )}
          {canSetPending > 0 && (
            <button
              onClick={onBulkSetPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              <Clock className="w-4 h-4" />
              Set Pending ({canSetPending})
            </button>
          )}
          {canPublish > 0 && (
            <button
              onClick={onBulkPublish}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              Publish ({canPublish})
            </button>
          )}
          {canUnpublish > 0 && (
            <button
              onClick={onBulkUnpublish}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <EyeOff className="w-4 h-4" />
              Unpublish ({canUnpublish})
            </button>
          )}
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete ({selectedCount})
          </button>
          <button
            onClick={onClearSelection}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
