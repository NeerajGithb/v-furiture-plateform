import { useState } from 'react';
import {
  Star, User, Package, Calendar, MessageSquare, CheckCircle, XCircle, Clock,
  AlertTriangle, ChevronDown, ChevronUp, Eye, Trash2
} from 'lucide-react';
import { AdminReview } from '@/types/review';

interface ReviewsTableProps {
  reviews: AdminReview[];
  selectedReviews: string[];
  onSelectReview: (reviewId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onUpdateStatus: (reviewId: string, status: string) => void;
  onDeleteReview: (reviewId: string) => void;
}

export default function ReviewsTable({
  reviews,
  selectedReviews,
  onSelectReview,
  onSelectAll,
  onUpdateStatus,
  onDeleteReview
}: ReviewsTableProps) {
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-200'
              }`}
          />
        ))}
      </div>
    );
  };

  const allSelected = reviews.length > 0 && selectedReviews.length === reviews.length;
  const someSelected = selectedReviews.length > 0 && selectedReviews.length < reviews.length;

  const handleToggleExpand = (reviewId: string) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">No reviews found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected;
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedReviews.length > 0
              ? `${selectedReviews.length} selected`
              : `${reviews.length} reviews`
            }
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {reviews.map((review) => (
          <div key={review._id} className="hover:bg-gray-50 transition-colors group">
            {/* Review Header */}
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedReviews.includes(review._id)}
                  onChange={() => onSelectReview(review._id)}
                  className="mt-1 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(review.rating)}
                        <span className="text-sm font-medium text-gray-900 ml-1">{review.title || 'Review'}</span>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">{review.comment}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {review.userId?.name || 'Anonymous'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {review.productId?.name || 'Product'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(review.status)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 ml-2">
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onUpdateStatus(review._id, 'approved')}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onUpdateStatus(review._id, 'rejected')}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleToggleExpand(review._id)}
                    className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  >
                    {expandedReview === review._id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Review Details */}
            {expandedReview === review._id && (
              <div className="px-6 pb-6 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  {/* Review Content */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        Review Content
                      </h3>

                      {review.title && (
                        <div className="mb-2">
                          <h4 className="font-medium text-gray-900">{review.title}</h4>
                        </div>
                      )}

                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {review.rating} out of 5 stars
                          </span>
                        </div>
                      </div>

                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                      </div>

                      {review.helpfulVotes && review.helpfulVotes > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            {review.helpfulVotes} people found this helpful
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    {/* Customer & Product */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Context</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <User className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{review.userId?.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">{review.userId?.email}</p>
                            {review.verifiedPurchase && (
                              <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Verified Purchase
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{review.productId?.name || 'Unknown Product'}</p>
                            {review.sellerId && (
                              <p className="text-xs text-gray-500">Sold by {review.sellerId.businessName}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Actions</h3>
                      <div className="space-y-2">
                        <button className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4" />
                          View Full Details
                        </button>

                        {review.status === 'pending' && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => onUpdateStatus(review._id, 'approved')}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onUpdateStatus(review._id, 'rejected')}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => onDeleteReview(review._id)}
                          className="w-full px-3 py-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}