import { RefreshCw, Settings } from 'lucide-react';
import { SellerProfile } from '@/types/sellerProfile';

interface ProfileHeaderProps {
  profile?: SellerProfile;
  onRefresh: () => void;
  refreshing: boolean;
}

export function ProfileHeader({ profile, onRefresh, refreshing }: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your seller account and business information</p>
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
        </div>
      </div>
    </div>
  );
}