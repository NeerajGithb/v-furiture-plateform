import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ToastProvider from '@/provider/ToastProvider';
import ReactQueryProvider from '@/provider/ReactQueryProvider';
import { NavigationLoaderBar, NavigationLoaderProvider } from '@/components/NavigationLoader';
import { ConfirmProvider } from '@/contexts/ConfirmContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Furniture Store',
  description: 'Premium furniture collection',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavigationLoaderBar />
        <ReactQueryProvider>
          <ConfirmProvider>
            <NavigationLoaderProvider>
              <main>
                {children}
              </main>
            </NavigationLoaderProvider>
          </ConfirmProvider>
        </ReactQueryProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
