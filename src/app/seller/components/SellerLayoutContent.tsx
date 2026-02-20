'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { useSessionSecurity } from '@/hooks/useSessionSecurity';
import SellerSidebar from './SellerSidebar';
import GlobalHeader from '@/components/GlobalHeader';

interface SidebarContextType {
  isCompact: boolean;
  setIsCompact: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCompact: false,
  setIsCompact: () => { },
});

export const useSidebar = () => useContext(SidebarContext);

export default function SellerLayoutContent({ children }: { children: React.ReactNode }) {
  const [isCompact, setIsCompactState] = useState(false);

  useSessionSecurity();

  const setIsCompact = (value: boolean) => {
    setIsCompactState(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sellerSidebarCompact', String(value));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sellerSidebarCompact');
      if (savedState === 'true') setIsCompactState(true);
    }
  }, []);

  return (
    <SidebarContext.Provider value={{ isCompact, setIsCompact }}>
      <div className="flex min-h-screen bg-[#F8F9FA]">
        <SellerSidebar />
        <div
          className={`flex-1 ${isCompact ? 'ml-[60px]' : 'ml-[220px]'
            } transition-all duration-200 flex flex-col min-h-screen`}
        >
          <GlobalHeader />
          <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}