'use client';

import { useState } from 'react';
import { 
  useSellerProfile, 
  useSellerProfileStats,
  useUpdateSellerProfile,
  useChangeSellerPassword,
  useRequestVerification
} from '@/hooks/seller/useSellerProfile';
import { ProfileSkeleton } from './components/ProfileSkeleton';
import { ProfileOverview } from './components/ProfileOverview';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileSettings } from './components/ProfileSettings';

export default function SellerProfilePage() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'business' | 'security' | 'verification'>('business');

  // React Query hooks
  const { data: profile, isLoading, refetch } = useSellerProfile();
  const { data: stats } = useSellerProfileStats();
  const updateProfile = useUpdateSellerProfile();
  const changePassword = useChangeSellerPassword();
  const requestVerification = useRequestVerification();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <>
      {isLoading && <ProfileSkeleton />}
      {!isLoading && (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
          <ProfileHeader
            profile={profile}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />

          <ProfileOverview
            profile={profile} 
            stats={stats} 
          />

          <ProfileSettings
            profile={profile}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            updateProfile={updateProfile}
            changePassword={changePassword}
            requestVerification={requestVerification}
          />
        </div>
      )}
    </>
  );
}