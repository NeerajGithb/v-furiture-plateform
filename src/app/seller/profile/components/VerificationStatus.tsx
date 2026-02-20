import { AlertCircle, CheckCircle, Clock, FileText, Shield } from 'lucide-react';
import { SellerProfile } from '@/types/seller/profile';

interface VerificationStatusProps {
  profile?: SellerProfile;
  requestVerification: {
    mutate: () => void;
    isPending: boolean;
  };
}

type VerifStatus = 'verified' | 'pending' | 'rejected' | 'unverified';
const STATUS_CFG: Record<VerifStatus, { dot: string; textColor: string; title: string; desc: string }> = {
  verified: { dot: 'bg-emerald-400', textColor: 'text-emerald-700', title: 'Account Verified', desc: 'Your business account has been successfully verified. You have access to all seller features.' },
  pending: { dot: 'bg-amber-400', textColor: 'text-amber-700', title: 'Verification Pending', desc: 'Your verification request is under review. This typically takes 2–3 business days.' },
  rejected: { dot: 'bg-rose-400', textColor: 'text-rose-600', title: 'Verification Rejected', desc: 'Your request was rejected. Please review the requirements and resubmit.' },
  unverified: { dot: 'bg-[#9CA3AF]', textColor: 'text-[#111111]', title: 'Verification Required', desc: 'Verify your business to unlock all seller features and increase listing limits.' },
};

const BENEFITS = [
  { title: 'Increased Trust', desc: 'Verified badge increases customer confidence' },
  { title: 'Higher Listing Limits', desc: 'List unlimited products after verification' },
  { title: 'Priority Support', desc: 'Access faster dedicated support channels' },
  { title: 'Marketing Tools', desc: 'Unlock access to promotional features' },
];

const REQUIRED_DOCS = [
  { title: 'Business Registration Certificate', desc: 'Official business registration document' },
  { title: 'Tax Identification Number', desc: 'Business tax ID or EIN' },
  { title: 'Bank Account Verification', desc: 'Business bank account statement' },
];

export function VerificationStatus({ profile, requestVerification }: VerificationStatusProps) {
  let status: VerifStatus = 'unverified';
  if (profile?.verified) status = 'verified';
  else if (profile?.documents?.some(d => d.status === 'pending')) status = 'pending';
  else if (profile?.documents?.some(d => d.status === 'rejected')) status = 'rejected';

  const cfg = STATUS_CFG[status];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[14px] font-bold text-[#111111]">Account Verification</h3>
        <p className="text-[12px] text-[#9CA3AF] mt-0.5">Verify your business to access premium seller features</p>
      </div>

      {/* Status banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg px-5 py-4">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 bg-[#F3F4F6] border border-[#E5E7EB] rounded-md flex items-center justify-center flex-shrink-0">
            {status === 'verified' && <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />}
            {status === 'pending' && <Clock className="w-4.5 h-4.5 text-amber-500" />}
            {status === 'rejected' && <AlertCircle className="w-4.5 h-4.5 text-rose-500" />}
            {status === 'unverified' && <Shield className="w-4.5 h-4.5 text-[#6B7280]" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              <h4 className={`text-[13px] font-bold ${cfg.textColor}`}>{cfg.title}</h4>
            </div>
            <p className="text-[12px] text-[#6B7280] leading-relaxed">{cfg.desc}</p>

            {(status === 'unverified' || status === 'rejected') && (
              <button
                onClick={() => requestVerification.mutate()}
                disabled={requestVerification.isPending}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white text-[12px] font-medium rounded-md hover:bg-[#222222] disabled:opacity-40 transition-colors"
              >
                {requestVerification.isPending
                  ? (status === 'rejected' ? 'Resubmitting…' : 'Submitting…')
                  : (status === 'rejected' ? 'Resubmit Verification' : 'Start Verification')
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg">
        <div className="px-5 py-3.5 border-b border-[#F3F4F6]">
          <h4 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Verification Benefits</h4>
        </div>
        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {BENEFITS.map(({ title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#111111]">{title}</p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Required Documents */}
      {!profile?.verified && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg">
          <div className="px-5 py-3.5 border-b border-[#F3F4F6]">
            <h4 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Required Documents</h4>
          </div>
          <div className="px-5 py-4 space-y-2.5">
            {REQUIRED_DOCS.map(({ title, desc }) => (
              <div key={title} className="flex items-center gap-3 px-3 py-2.5 bg-[#F8F9FA] border border-[#F3F4F6] rounded-md">
                <div className="w-7 h-7 bg-white border border-[#E5E7EB] rounded-md flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#374151]">{title}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}