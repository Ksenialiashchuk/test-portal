'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import RouteGuard from '@/components/auth/RouteGuard';

interface AppLayoutProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AppLayout({ children, allowedRoles }: AppLayoutProps) {
  return (
    <RouteGuard allowedRoles={allowedRoles}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
