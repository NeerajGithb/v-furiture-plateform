import { redirect } from 'next/navigation';
import { getCurrentSeller } from '@/lib/server/auth';
import SellerLayoutContent from './components/SellerLayoutContent';

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  // SERVER-SIDE AUTHENTICATION CHECK - MOST IMPORTANT SECURITY GATE
  const seller = await getCurrentSeller();
  
  if (!seller) {
    redirect('/login/seller');
  }

  // Authentication passed, render the layout
  return (
    <SellerLayoutContent>
      {children}
    </SellerLayoutContent>
  );
}
