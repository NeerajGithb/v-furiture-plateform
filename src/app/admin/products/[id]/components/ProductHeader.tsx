import { ArrowLeft, CheckCircle, XCircle, Clock, Trash2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AdminProduct } from '@/types/admin/products';

interface ProductHeaderProps {
  product?: AdminProduct;
  isMutating: boolean;
  onApprove: () => void;
  onReject: () => void;
  onSetPending: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}

export default function ProductHeader({
  product,
  isMutating,
  onApprove,
  onReject,
  onSetPending,
  onTogglePublish,
  onDelete
}: ProductHeaderProps) {
  const router = useRouter();

  if (!product) return null;

  const getStatusBadge = () => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
      APPROVED: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
    };
    const config = statusConfig[product.status] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded border text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {product.status}
      </span>
    );
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/products')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-600">ID: {product.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onApprove}
            disabled={product.status === 'APPROVED' || isMutating}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={onReject}
            disabled={product.status === 'REJECTED' || isMutating}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={onSetPending}
            disabled={product.status === 'PENDING' || isMutating}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
          >
            <Clock className="w-4 h-4" />
            Set Pending
          </button>
          <button
            onClick={onTogglePublish}
            disabled={isMutating}
            className={`px-4 py-2 text-white rounded transition-colors flex items-center gap-2 text-sm ${
              product.isPublished 
                ? 'bg-gray-600 hover:bg-gray-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {product.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {product.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            disabled={isMutating}
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}