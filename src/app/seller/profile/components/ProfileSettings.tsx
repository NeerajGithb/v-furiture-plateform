import { SellerProfile, UpdateProfileRequest, ChangePasswordRequest } from '@/types/sellerProfile';
import { BusinessInformation } from './BusinessInformation';
import { SecuritySettings } from './SecuritySettings';
import { VerificationStatus } from './VerificationStatus';
interface ProfileSettingsProps {
  profile?: SellerProfile;
  activeTab: 'business' | 'security' | 'verification';
  onTabChange: (tab: 'business' | 'security' | 'verification') => void;
  updateProfile: {
    mutate: (data: UpdateProfileRequest) => void;
    isPending: boolean;
  };
  changePassword: {
    mutate: (data: ChangePasswordRequest) => void;
    isPending: boolean;
  };
  requestVerification: {
    mutate: () => void;
    isPending: boolean;
  };
}

export function ProfileSettings({
  profile,
  activeTab,
  onTabChange,
  updateProfile,
  changePassword,
  requestVerification
}: ProfileSettingsProps) {
  const tabs = [
    { id: 'business', label: 'Business Information', count: null },
    { id: 'security', label: 'Security', count: null },
    { id: 'verification', label: 'Verification', count: profile?.verified ? null : '!' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : tab.count === '!'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'business' && (
          <BusinessInformation
            profile={profile} 
            updateProfile={updateProfile} 
          />
        )}

        {activeTab === 'security' && (
          <SecuritySettings 
            changePassword={changePassword} 
          />
        )}

        {activeTab === 'verification' && (
          <VerificationStatus
            profile={profile} 
            requestVerification={requestVerification} 
          />
        )}
      </div>
    </div>
  );
}