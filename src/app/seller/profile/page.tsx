'use client';

import { useState } from 'react';
import { 
  useSellerProfile, 
  useSellerProfileStats,
  useUpdateSellerProfile,
  useChangeSellerPassword,
  useRequestVerification
} from '@/hooks/seller/useSellerProfile';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import PageHeader from '@/components/PageHeader';
import { ProfileOverview } from './components/ProfileOverview';
import { ProfileSettings } from './components/ProfileSettings';

export default function SellerProfilePage() {
  const [activeTab, setActiveTab] = useState<'business' | 'security' | 'verification'>('business');

  const { data: profile, isPending, error, refetch, isFetching } = useSellerProfile();
  const { data: stats } = useSellerProfileStats();
  const updateProfile = useUpdateSellerProfile();
  const changePassword = useChangeSellerPassword();
  const requestVerification = useRequestVerification();

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your seller profile and settings"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <LoaderGuard 
        isLoading={isPending} 
        error={error}
        isEmpty={!profile}
        emptyMessage="No profile data"
      >
        {() => (
          <div className="space-y-6 max-w-7xl mx-auto">
            <ProfileOverview
              profile={profile!} 
              stats={stats} 
            />

            <ProfileSettings
              profile={profile!}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              updateProfile={updateProfile}
              changePassword={changePassword}
              requestVerification={requestVerification}
            />
          </div>
        )}
      </LoaderGuard>
    </>
  );
}