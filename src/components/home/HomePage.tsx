'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Store } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VFurniture Platform</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Admin</h2>
              </div>
              <Link
                href="/login/admin"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Admin Login
              </Link>
            </div>
          </div>

          {/* Seller Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Store className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Seller</h2>
              </div>
              <div className="w-full space-y-3">
                <Link
                  href="/login/seller"
                  className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Seller Login
                </Link>
                <Link
                  href="/signup/seller"
                  className="block w-full px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  Register as Seller
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
