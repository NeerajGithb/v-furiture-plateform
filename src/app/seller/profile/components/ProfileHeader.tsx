import { RefreshCw } from 'lucide-react';
import { SellerProfile } from '@/types/seller/profile';

interface ProfileHeaderProps {
  profile?: SellerProfile;
  onRefresh: () => void;
  refreshing: boolean;
}

export function ProfileHeader({ onRefresh, refreshing }: ProfileHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-[20px] font-semibold text-[#111111] tracking-tight leading-tight">Profile Settings</h1>
        <p className="text-[13px] text-[#6B7280] mt-0.5">Manage your seller account and business information</p>
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        aria-label="Refresh profile"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#555555] bg-white border border-[#E5E7EB] rounded-md hover:bg-[#F8F9FA] hover:text-[#111111] hover:border-[#D1D5DB] disabled:opacity-40 transition-all"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
  );
}