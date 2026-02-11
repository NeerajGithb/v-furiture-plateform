import { useState } from 'react';
import { Building2, Phone, FileText, Save, User } from 'lucide-react';
import { SellerProfile, UpdateProfileRequest } from '@/types/seller/profile';
import toast from 'react-hot-toast';

interface BusinessInformationProps {
  profile?: SellerProfile;
  updateProfile: {
    mutate: (data: UpdateProfileRequest) => void;
    isPending: boolean;
  };
}

export function BusinessInformation({ profile, updateProfile }: BusinessInformationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: profile?.businessName || '',
    contactPerson: profile?.contactPerson || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
          <p className="text-sm text-gray-600 mt-1">Update your business details and contact information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter your complete business address"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
            >
              <Save className="w-4 h-4" />
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Business Name</p>
                <p className="font-medium text-gray-900 mt-1">{profile?.businessName || 'Not set'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Person</p>
                <p className="font-medium text-gray-900 mt-1">{profile?.contactPerson || 'Not set'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <p className="font-medium text-gray-900 mt-1">{profile?.phone || 'Not set'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Business Address</p>
                <p className="font-medium text-gray-900 mt-1 whitespace-pre-line">{profile?.address || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}