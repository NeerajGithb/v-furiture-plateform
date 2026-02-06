'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Store } from 'lucide-react';

export default function HomePage() {
  const roles = [
    {
      type: 'admin',
      title: 'Admin Console',
      description: 'Platform management, analytics, and system configuration.',
      loginPath: '/login/admin',
      icon: Shield,
      features: [
        { label: 'User Management' },
        { label: 'System Analytics' },
        { label: 'Global Settings' },
      ],
    },
    {
      type: 'seller',
      title: 'Seller Central',
      description: 'Product catalog, order processing, and store performance.',
      loginPath: '/login/seller',
      signupPath: '/signup/seller',
      icon: Store,
      features: [
        { label: 'Inventory Control' },
        { label: 'Order Fulfillment' },
        { label: 'Sales Reports' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Furniture Platform Portal
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Select your portal to continue
          </p>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {roles.map((role) => (
              <div key={role.type} className="p-8 hover:bg-gray-50/50 transition-colors duration-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-100 rounded-md">
                    <role.icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">{role.title}</h2>
                </div>

                <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                  {role.description}
                </p>

                <div className="space-y-3 mb-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Features</h3>
                  <ul className="space-y-2">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2.5"></span>
                        {feature.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <Link
                    href={role.loginPath}
                    className="flex w-full items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  {role.signupPath && (
                    <Link
                      href={role.signupPath}
                      className="flex w-full items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                      Register
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2026 Furniture Platform. Enterprise Version 2.4.0
          </p>
        </div>
      </div>
    </div>
  );
}
