import { useState } from 'react';
import { Star, Reply, Calendar, User, Package, Shield, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: string;
  isVerifiedPurchase?: boolean;
  userId?: { name: string };
  productId?: { name: string; mainImage?: { url: string } };
  sellerResponse?: { message: string; respondedAt: string };
}

interface ReviewsListProps {
  reviews: Review[];
  onRespond: (reviewId: string, message: string) => Promise<void>;
  isResponding: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  approved: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  pending: 'bg-amber-50 border-amber-200 text-amber-700',
  rejected: 'bg-rose-50 border-rose-200 text-rose-600',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < rating ? 'text-amber-400 fill-current' : 'text-[#E5E7EB]'}`}
        />
      ))}
    </div>
  );
}

export function ReviewsList({ reviews, onRespond, isResponding }: ReviewsListProps) {
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) { toast.error('Please enter a response'); return; }
    await onRespond(reviewId, responseText);
    setRespondingTo(null);
    setResponseText('');
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
      {/* Table header */}
      <div className="px-5 py-2.5 bg-[#F8F9FA] border-b border-[#E5E7EB] grid grid-cols-[64px_1fr_80px_100px_80px] gap-4 items-center">
        <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Product</span>
        <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Review</span>
        <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Rating</span>
        <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Status</span>
        <div />
      </div>

      <div className="divide-y divide-[#F3F4F6]">
        {reviews.map((review) => (
          <div key={review._id} className="px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
            <div className="grid grid-cols-[64px_1fr_80px_100px_80px] gap-4 items-start">
              {/* Product image */}
              <div className="w-12 h-12 bg-[#F3F4F6] border border-[#E5E7EB] rounded-md overflow-hidden flex-shrink-0">
                {review.productId?.mainImage?.url ? (
                  <img src={review.productId.mainImage.url} alt={review.productId.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#111111] truncate mb-0.5">
                  {review.productId?.name || 'Unknown Product'}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[#9CA3AF] mb-2">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{review.userId?.name || 'Anonymous'}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {review.isVerifiedPurchase && (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium"><Shield className="w-3 h-3" />Verified</span>
                  )}
                </div>
                <p className="text-[12px] text-[#555555] leading-relaxed line-clamp-2">{review.comment}</p>

                {/* Seller response or respond button */}
                <div className="mt-3">
                  {review.sellerResponse ? (
                    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3 py-2.5">
                      <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1">Your Response</p>
                      <p className="text-[12px] text-[#374151]">{review.sellerResponse.message}</p>
                      <p className="text-[10px] text-[#9CA3AF] mt-1">
                        {new Date(review.sellerResponse.respondedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : respondingTo === review._id ? (
                    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3">
                      <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Write Response</p>
                      <textarea
                        value={responseText}
                        onChange={e => setResponseText(e.target.value)}
                        placeholder="Write your response…"
                        rows={3}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-[12px] text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleRespond(review._id)}
                          disabled={isResponding}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white text-[12px] font-medium rounded-md hover:bg-[#222222] disabled:opacity-40 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isResponding ? 'Submitting…' : 'Submit'}
                        </button>
                        <button
                          onClick={() => { setRespondingTo(null); setResponseText(''); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] text-[#555555] text-[12px] font-medium rounded-md hover:bg-[#F8F9FA] transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingTo(review._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] text-[#555555] text-[12px] font-medium rounded-md hover:bg-[#F8F9FA] hover:text-[#111111] transition-all"
                    >
                      <Reply className="w-3.5 h-3.5" /> Respond
                    </button>
                  )}
                </div>
              </div>

              {/* Stars */}
              <div className="pt-0.5">
                <StarRating rating={review.rating} />
                <span className="text-[11px] font-semibold text-[#374151] mt-0.5 block">{review.rating}.0</span>
              </div>

              {/* Status */}
              <div className="pt-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold border rounded-md capitalize ${STATUS_BADGE[review.status] || 'bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280]'}`}>
                  {review.status}
                </span>
              </div>

              <div />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}