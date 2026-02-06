'use client';

import { useEffect, useState } from 'react';
import { Shield, X, Clock, Eye } from 'lucide-react';

export function SecurityNotice() {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Show security notice on first visit or after 24 hours
    const lastShown = localStorage.getItem('security_notice_shown');
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    if (!lastShown || (now - parseInt(lastShown)) > dayInMs) {
      setShowNotice(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowNotice(false);
    localStorage.setItem('security_notice_shown', Date.now().toString());
  };

  if (!showNotice) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-gray-700" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Enhanced Security Active
          </h4>
          <div className="text-xs text-gray-600 space-y-1.5">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>Auto-logout after 30min inactivity</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-gray-400" />
              <span>Session expires when browser closes</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-gray-400" />
              <span>Maximum 8-hour session duration</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 font-medium">
            Your data is protected with enterprise-grade security.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}