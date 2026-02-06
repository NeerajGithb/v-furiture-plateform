import { AlertCircle, CheckCircle, Clock, Upload, FileText, Shield } from 'lucide-react';
import { SellerProfile } from '@/types/sellerProfile';
import toast from 'react-hot-toast';

interface VerificationStatusProps {
  profile?: SellerProfile;
  requestVerification: {
    mutate: () => void;
    isPending: boolean;
  };
}

export function VerificationStatus({ profile, requestVerification }: VerificationStatusProps) {
  const handleRequestVerification = async () => {
    requestVerification.mutate();
  };

  const getVerificationStatus = () => {
    if (profile?.verified) {
      return {
        status: 'verified',
        icon: <CheckCircle className="w-6 h-6 text-green-600" />,
        title: 'Account Verified',
        description: 'Your business account has been successfully verified. You have access to all seller features.',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800'
      };
    }

    // Check if there are pending documents
    const hasPendingDocuments = profile?.documents?.some(doc => doc.status === 'pending');
    if (hasPendingDocuments) {
      return {
        status: 'pending',
        icon: <Clock className="w-6 h-6 text-yellow-600" />,
        title: 'Verification Pending',
        description: 'Your verification request is being reviewed. This process typically takes 2-3 business days.',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800'
      };
    }

    // Check if there are rejected documents
    const hasRejectedDocuments = profile?.documents?.some(doc => doc.status === 'rejected');
    if (hasRejectedDocuments) {
      return {
        status: 'rejected',
        icon: <AlertCircle className="w-6 h-6 text-red-600" />,
        title: 'Verification Rejected',
        description: 'Your verification request was rejected. Please review the requirements and submit again.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800'
      };
    }

    return {
      status: 'unverified',
      icon: <Shield className="w-6 h-6 text-gray-600" />,
      title: 'Account Verification Required',
      description: 'Verify your business account to unlock all seller features and increase your listing limits.',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-800'
    };
  };

  const statusInfo = getVerificationStatus();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Account Verification</h3>
        <p className="text-sm text-gray-600 mt-1">Verify your business to access premium seller features</p>
      </div>

      {/* Verification Status Card */}
      <div className={`${statusInfo.bgColor} rounded-lg p-6 border ${statusInfo.borderColor}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {statusInfo.icon}
          </div>
          <div className="flex-1">
            <h4 className={`text-base font-semibold ${statusInfo.textColor}`}>
              {statusInfo.title}
            </h4>
            <p className={`text-sm ${statusInfo.textColor} mt-1`}>
              {statusInfo.description}
            </p>
            
            {statusInfo.status === 'unverified' && (
              <button
                onClick={handleRequestVerification}
                disabled={requestVerification.isPending}
                className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
              >
                {requestVerification.isPending ? 'Submitting...' : 'Start Verification'}
              </button>
            )}

            {statusInfo.status === 'rejected' && (
              <button
                onClick={handleRequestVerification}
                disabled={requestVerification.isPending}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
              >
                {requestVerification.isPending ? 'Resubmitting...' : 'Resubmit Verification'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verification Benefits */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-base font-semibold text-gray-900 mb-4">Verification Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Increased Trust</p>
              <p className="text-sm text-gray-600">Verified badge increases customer confidence</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Higher Listing Limits</p>
              <p className="text-sm text-gray-600">List unlimited products</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Priority Support</p>
              <p className="text-sm text-gray-600">Get faster customer support</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Marketing Tools</p>
              <p className="text-sm text-gray-600">Access to promotional features</p>
            </div>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      {!profile?.verified && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Required Documents</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Business Registration Certificate</p>
                <p className="text-sm text-gray-600">Official business registration document</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Tax Identification Number</p>
                <p className="text-sm text-gray-600">Business tax ID or EIN</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Bank Account Verification</p>
                <p className="text-sm text-gray-600">Business bank account statement</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}