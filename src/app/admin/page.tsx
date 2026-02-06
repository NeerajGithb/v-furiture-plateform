'use client';

import { useEffect } from 'react';
import { useNavigate } from '@/components/NavigationLoader';
import { Loader } from '@/components/ui/Loader';


export default function AdminPage() {
  const router = useNavigate();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader />
    </div>
  );
}
