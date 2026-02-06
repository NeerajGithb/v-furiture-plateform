import { useCallback } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export const useSessionSecurity = () => {
  const { logout } = useAuthGuard();

  // Force logout function
  const forceLogout = useCallback(async () => {
    await logout();
    
    // Clear all storage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.removeItem('platform_cache');
      
      // Redirect to appropriate login based on current path
      const currentPath = window.location.pathname;
      const loginUrl = currentPath.startsWith('/admin') ? '/login/admin' : '/login/seller';
      window.location.href = loginUrl;
    }
  }, [logout]);

  return {
    forceLogout,
  };
};