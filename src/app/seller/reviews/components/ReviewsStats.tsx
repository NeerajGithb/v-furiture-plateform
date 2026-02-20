import { MessageSquare, Star, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ReviewsStatsProps {
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
}

export function ReviewsStats({ stats }: ReviewsStatsProps) {
  if (!stats) return null;

  const items = [
    {
      label: 'Total Reviews',
      value: stats.totalReviews ?? stats.total ?? 0,
      icon: MessageSquare,
      dot: 'bg-[#6B7280]',
    },
    {
      label: 'Avg. Rating',
      value: (stats.averageRating ?? stats.avgRating ?? 0).toFixed(1),
      icon: Star,
      dot: 'bg-amber-400',
    },
    {
      label: 'Pending',
      value: stats.pendingReviews ?? stats.pending ?? 0,
      icon: Clock,
      dot: 'bg-amber-400',
    },
    {
      label: 'Approved',
      value: stats.approvedReviews ?? stats.approved ?? 0,
      icon: CheckCircle,
      dot: 'bg-emerald-400',
    },
    {
      label: 'Rejected',
      value: stats.rejectedReviews ?? stats.rejected ?? 0,
      icon: XCircle,
      dot: 'bg-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map(({ label, value, icon: Icon, dot }) => (
        <div
          key={label}
          className="bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
              {label}
            </span>
            <div className="w-7 h-7 bg-[#F8F9FA] border border-[#F3F4F6] rounded-md flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
            <span className="text-[24px] font-bold text-[#111111] tabular-nums leading-none">
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
