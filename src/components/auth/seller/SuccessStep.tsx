'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuccessStep() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
        <p className="text-gray-600">
          Your seller account has been created successfully and is pending admin approval.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-blue-800 space-y-1 text-left">
          <li>• Our admin team will review your application</li>
          <li>• You'll receive an email notification once approved</li>
          <li>• After approval, you can start adding products</li>
          <li>• This process typically takes 1-2 business days</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => router.push('/login/seller')}
          className="w-full py-3 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all"
        >
          Go to Login
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </motion.div>
  );
}