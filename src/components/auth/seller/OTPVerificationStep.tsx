'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import OTPInput from '../OTPInput';

interface OTPVerificationStepProps {
  email: string;
  otpCode: string;
  loading: boolean;
  error: string;
  resendCooldown: number;
  onCodeChange: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  onBack: () => void;
}

export default function OTPVerificationStep({
  email,
  otpCode,
  loading,
  error,
  resendCooldown,
  onCodeChange,
  onSubmit,
  onResend,
  onBack,
}: OTPVerificationStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <OTPInput
          loading={loading}
          error={error}
          code={otpCode}
          email={email}
          onCodeChange={onCodeChange}
          onResend={onResend}
        />

        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full py-3 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              'Verifying...'
            ) : (
              <>
                Verify Code
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Email
            </button>

            {resendCooldown > 0 && (
              <span className="text-sm text-gray-500">
                Resend in {resendCooldown}s
              </span>
            )}
          </div>
        </div>
      </form>
    </motion.div>
  );
}