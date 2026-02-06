'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useSellerLogin, useAdminLogin } from '@/hooks/useAuth';
import { useNavigate } from '../NavigationLoader';

interface LoginFormProps {
  userType: 'seller' | 'admin';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export default function LoginForm({
  userType,
  title,
  subtitle,
  icon,
}: LoginFormProps) {
  const router = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Determine which hook to use based on userType
  const sellerLoginMutation = useSellerLogin();
  const adminLoginMutation = useAdminLogin();
  
  const loginMutation = userType === 'admin' ? adminLoginMutation : sellerLoginMutation;
  const { mutate: login, isPending: loading, error } = loginMutation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-4 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:text-gray-900">
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                placeholder="name@company.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors focus:outline-none"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error.message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            &larr; Back to Home
          </button>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        userType={userType}
      />
    </div>
  );
}
