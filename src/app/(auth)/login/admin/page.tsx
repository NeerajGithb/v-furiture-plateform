'use client';

import LoginForm from '@/components/auth/LoginForm';
import { Shield } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm
        userType="admin"
        title="Admin Sign In"
        subtitle="Access the admin console"
        icon={<Shield />}
      />
    </div>
  );
}