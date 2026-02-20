import { User, Mail, Phone, MapPin, Shield, CheckCircle, AlertCircle, X, Package, ShoppingBag, Star } from 'lucide-react';
import { SellerProfile, SellerProfileStats } from '@/types/seller/profile';

interface ProfileOverviewProps {
  profile?: SellerProfile;
  stats?: SellerProfileStats;
}

const STATUS_CFG: Record<string, { dot: string; label: string; color: string }> = {
  active: { dot: 'bg-emerald-400', label: 'Active', color: 'text-emerald-700' },
  pending: { dot: 'bg-amber-400', label: 'Pending', color: 'text-amber-700' },
  suspended: { dot: 'bg-rose-400', label: 'Suspended', color: 'text-rose-600' },
};

const profileStats = (profile?: SellerProfile) => [
  { label: 'Total Products', value: profile?.totalProducts ?? 0, icon: Package, dot: 'bg-[#6B7280]' },
  { label: 'Total Sales', value: profile?.totalSales ?? 0, icon: ShoppingBag, dot: 'bg-blue-400' },
  { label: 'Rating', value: (profile?.rating?.toFixed(1) ?? '0.0'), icon: Star, dot: 'bg-amber-400' },
  { label: 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).getFullYear() : 'N/A', icon: User, dot: 'bg-[#9CA3AF]' },
];

export function ProfileOverview({ profile }: ProfileOverviewProps) {
  const statusKey = profile?.status || 'pending';
  const statusCfg = STATUS_CFG[statusKey] || STATUS_CFG.pending;

  return (
    <div className="space-y-4">
      {/* Identity card */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg px-5 py-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 bg-[#F3F4F6] border border-[#E5E7EB] rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-[#9CA3AF]" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h2 className="text-[16px] font-bold text-[#111111] truncate">{profile?.businessName || 'Seller Account'}</h2>

              {/* Status badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[10px] font-semibold">
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                <span className={statusCfg.color}>{statusCfg.label}</span>
              </span>

              {/* Verified badge */}
              {profile?.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-md text-[10px] font-semibold text-blue-700">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#6B7280]">
              {profile?.email && (
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{profile.email}</span>
              )}
              {profile?.phone && (
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{profile.phone}</span>
              )}
              {profile?.address && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.address}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {profileStats(profile).map(({ label, value, icon: Icon, dot }) => (
          <div key={label} className="bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-150">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">{label}</span>
              <div className="w-7 h-7 bg-[#F8F9FA] border border-[#F3F4F6] rounded-md flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-[#6B7280]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
              <span className="text-[22px] font-bold text-[#111111] tabular-nums leading-none">{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}