'use client';

import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Store } from 'lucide-react';

export default function SellerLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm
        userType="seller"
        title="Seller Sign In"
        subtitle="Access your seller dashboard"
        icon={<Store />}
      />
    </div>
  );
}