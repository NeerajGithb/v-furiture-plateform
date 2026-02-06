import { Download, Star, MessageSquare, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ReviewsHeaderProps {
  stats?: {
    total?: number;
    totalReviews?: number;
    averageRating?: number;
    avgRating?: number;
    pending?: number;
    pendingReviews?: number;
    approved?: number;
    approvedReviews?: number;
    rejected?: number;
    rejectedReviews?: number;
  };
  onExport: () => void;
  onRefresh: () => void;
  isExporting: boolean;
  refreshing: boolean;
}

export function ReviewsHeader({ stats, onExport, onRefresh, isExporting, refreshing }: ReviewsHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Manage feedback from your customers</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Total</span>
              <MessageSquare className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalReviews || stats.total || 0}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Average</span>
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.averageRating ? stats.averageRating.toFixed(1) : (stats.avgRating ? stats.avgRating.toFixed(1) : '0.0')}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Pending</span>
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews || stats.pending || 0}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Approved</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.approvedReviews || stats.approved || 0}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Rejected</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.rejectedReviews || stats.rejected || 0}</p>
          </div>
        </div>
      )}
    </>
  );
}