import { User, Mail, Phone, MapPin, Shield, CheckCircle, AlertCircle, X } from 'lucide-react';
import { SellerProfile, SellerProfileStats } from '@/types/sellerProfile';

interface ProfileOverviewProps {
  profile?: SellerProfile;
  stats?: SellerProfileStats;
}

export function ProfileOverview({ profile, stats }: ProfileOverviewProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'pending':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'suspended':
        return 'bg-rose-50 text-rose-700 ring-rose-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'pending':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'suspended':
        return <X className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900">{profile?.businessName}</h2>
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset flex items-center gap-1.5 ${getStatusColor(profile?.status || 'pending')}`}>
                {getStatusIcon(profile?.status || 'pending')}
                <span className="capitalize">{profile?.status}</span>
              </span>
              {profile?.verified && (
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-600/20 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                {profile?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                {profile?.phone || 'Not provided'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                {profile?.address || 'Address not set'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 mb-1">Total Products</span>
            <span className="text-2xl font-bold text-gray-900">{profile?.totalProducts || 0}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 mb-1">Total Sales</span>
            <span className="text-2xl font-bold text-gray-900">{profile?.totalSales || 0}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 mb-1">Rating</span>
            <span className="text-2xl font-bold text-gray-900">{profile?.rating?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 mb-1">Member Since</span>
            <span className="text-2xl font-bold text-gray-900">
              {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}