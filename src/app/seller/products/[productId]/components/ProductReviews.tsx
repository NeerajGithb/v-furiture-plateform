import { Star, MessageCircle } from 'lucide-react';

interface ProductReviewsProps {
  reviewsData?: {
    reviews: any[];
    pagination: { page: number; limit: number; total: number; pages: number };
    summary: { average: number; count: number; distribution: { [key: number]: number } };
  };
}

export function ProductReviews({ reviewsData }: ProductReviewsProps) {
  if (!reviewsData || reviewsData.reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-500">This product hasn't received any reviews from customers yet.</p>
      </div>
    );
  }

  const { reviews, summary } = reviewsData;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(summary.average) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {summary.average.toFixed(1)}
            </span>
            <span className="text-gray-500">({summary.count} reviews)</span>
          </div>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = summary.distribution[rating] || 0;
            const percentage = summary.count > 0 ? (count / summary.count) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-8">
                  {rating}★
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review: any) => (
          <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {review.customerName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.customerName || 'Anonymous'}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-4">
                {review.images.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
            
            {review.helpful && (
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  {review.helpful} people found this helpful
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {reviewsData.pagination.pages > 1 && (
        <div className="text-center">
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}