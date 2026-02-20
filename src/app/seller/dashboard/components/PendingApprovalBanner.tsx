'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface PendingApprovalBannerProps {
  status?: string;
}

export function PendingApprovalBanner({ status }: PendingApprovalBannerProps) {
  const [show, setShow] = useState(true);

  if (status !== 'pending' || !show) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-4 py-3.5 mb-5"
    >
      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#92400E]">Account Pending Approval</p>
        <p className="text-[12px] text-[#B45309] mt-0.5 leading-relaxed">
          Your seller account is under review. Full access will be granted upon approval.
        </p>
      </div>
      <button
        onClick={() => setShow(false)}
        aria-label="Dismiss banner"
        className="text-amber-400 hover:text-amber-600 p-0.5 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
