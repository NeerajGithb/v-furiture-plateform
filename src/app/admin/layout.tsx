import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/server/auth';
import AdminLayoutContent from './components/AdminLayoutContent';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SERVER-SIDE AUTHENTICATION CHECK - MOST IMPORTANT SECURITY GATE
  const admin = await getCurrentAdmin();
  
  if (!admin) {
    redirect('/login/admin');
  }

  // Authentication passed, render the layout
  return (
    <AdminLayoutContent>
      {children}
    </AdminLayoutContent>
  );
}