'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { useSessionSecurity } from '@/hooks/useSessionSecurity';
import { SecurityNotice } from '@/components/SecurityNotice';
import AdminSidebar from './AdminSidebar';
import GlobalHeader from '@/components/GlobalHeader';

interface SidebarContextType {
  isCompact: boolean;
  setIsCompact: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCompact: false,
  setIsCompact: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [isCompact, setIsCompactState] = useState(false);
  
  // Initialize session security for admin
  useSessionSecurity();

  // Save sidebar state to localStorage whenever it changes
  const setIsCompact = (value: boolean) => {
    setIsCompactState(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminSidebarCompact', String(value));
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('adminSidebarCompact');
      if (savedState === 'true') {
        setIsCompactState(true);
      }
    }
  }, []);

  return (
    <SidebarContext.Provider value={{ isCompact, setIsCompact }}>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div 
          className={`flex-1 ${
            isCompact ? 'ml-16' : 'ml-64'
          } transition-all duration-300 flex flex-col`}
        >
          <GlobalHeader />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
        <SecurityNotice />
      </div>
    </SidebarContext.Provider>
  );
}