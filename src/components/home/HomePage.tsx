'use client';

import React from 'react';
import { NavLink } from '@/components/NavigationLoader';
import { Shield, Store, ArrowRight } from 'lucide-react';

/**
 * HomePage Component
 * Professional portal selection with enterprise design
 */
export default function HomePage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            V-Furniture Platform
          </h1>
          <p className="text-base text-slate-600">
            Select your portal to access the platform
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Portal */}
          <PortalCard
            icon={Shield}
            title="Admin Portal"
            description="Platform administration and management"
            primaryAction={{
              label: 'Access Admin Portal',
              href: '/login/admin'
            }}
          />

          {/* Seller Portal */}
          <PortalCard
            icon={Store}
            title="Seller Portal"
            description="Manage your products, orders, and storefront"
            primaryAction={{
              label: 'Sign In',
              href: '/login/seller'
            }}
            secondaryAction={{
              label: 'Create Seller Account',
              href: '/signup/seller'
            }}
          />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            Secure authentication • Enterprise-grade infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}

interface PortalCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

function PortalCard({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: PortalCardProps): React.ReactElement {
  return (
    <div className="bg-white border border-slate-200/80 rounded-lg p-8 hover:shadow-lg hover:border-slate-300 transition-all duration-200">
      {/* Icon & Content */}
      <div className="flex items-start gap-5 mb-8">
        <div className="w-14 h-14 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {title}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <NavLink
          href={primaryAction.href}
          className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
        >
          {primaryAction.label}
          <ArrowRight className="w-4 h-4" />
        </NavLink>

        {secondaryAction && (
          <NavLink
            href={secondaryAction.href}
            className="flex items-center justify-center w-full px-5 py-3 border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            {secondaryAction.label}
          </NavLink>
        )}
      </div>
    </div>
  );
}
