import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface PendingApprovalBannerProps {
  status?: string;
}

export function PendingApprovalBanner({ status }: PendingApprovalBannerProps) {
  const [show, setShow] = useState(true);

  if (status !== 'pending' || !show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 border border-amber-200 rounded-md p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-900">Account Pending Approval</h3>
          <p className="text-sm text-amber-800 mt-1 leading-relaxed">
            Your seller account is currently under review. Most features are available, but full visibility will be granted upon approval.
          </p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-amber-700 hover:text-amber-900 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
