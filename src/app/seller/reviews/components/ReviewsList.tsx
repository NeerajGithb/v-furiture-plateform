import { useState } from 'react';
import {
  Star,
  MessageSquare,
  Reply,
  Calendar,
  User,
  Package,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: string;
  isVerifiedPurchase?: boolean;
  userId?: {
    name: string;
  };
  productId?: {
    name: string;
    mainImage?: {
      url: string;
    };
  };
  sellerResponse?: {
    message: string;
    respondedAt: string;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  onRespond: (reviewId: string, message: string) => Promise<void>;
  isResponding: boolean;
}

export function ReviewsList({ reviews, onRespond, isResponding }: ReviewsListProps) {
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < rating ? 'text-amber-400 fill-current' : 'text-gray-200'
        }`}
      />
    ));
  };

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    await onRespond(reviewId, responseText);
    setRespondingTo(null);
    setResponseText('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'pending':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 ring-rose-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
        <p className="text-gray-500">Customer reviews will appear here when available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200">
        {reviews.map((review) => (
          <div key={review._id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-5">
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                {review.productId?.mainImage?.url ? (
                  <img
                    src={review.productId.mainImage.url}
                    alt={review.productId.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-0.5">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                        {review.rating}.0
                      </span>
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <Shield className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm truncate max-w-md">
                      {review.productId?.name}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {review.userId?.name || 'Anonymous'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset capitalize ${getStatusColor(review.status)}`}>
                    {review.status}
                  </span>
                </div>

                {/* Review Comment */}
                <div className="mb-4 text-sm text-gray-700 leading-relaxed">
                  {review.comment}
                </div>

                {/* Seller Response */}
                {review.sellerResponse ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Your Response
                    </p>
                    <p className="text-sm text-gray-700">{review.sellerResponse.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Responded on {new Date(review.sellerResponse.respondedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div>
                    {respondingTo === review._id ? (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Write a Response
                        </p>
                        <div className="space-y-3">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response to this review..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none bg-white"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRespond(review._id)}
                              disabled={isResponding}
                              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
                            >
                              {isResponding ? 'Submitting...' : 'Submit Response'}
                            </button>
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText('');
                              }}
                              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingTo(review._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        <Reply className="w-4 h-4" />
                        Respond to Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}