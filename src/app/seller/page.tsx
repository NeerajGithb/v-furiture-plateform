'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Loader = ({ text = 'Loading...', fullScreen = false }) => {
  const containerClasses = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center min-h-[60vh]';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="animate-spin rounded-full border-b-2 h-12 w-12 border-blue-600 mx-auto"></div>
        {text && <p className="mt-4 text-gray-600">{text}</p>}
      </div>
    </div>
  );
};

export default function SellerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/seller/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader />
    </div>
  );
}
