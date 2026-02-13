'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getStoredUser, isAdmin } from '@/lib/auth';
import { useCurrentUser } from '@/lib/queries/useUsers';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  const effectiveUser = user || getStoredUser();

  if (allowedRoles && effectiveUser?.role) {
    if (!allowedRoles.includes(effectiveUser.role.name) && !isAdmin(effectiveUser)) {
      router.push('/dashboard');
      return null;
    }
  }

  return <>{children}</>;
}
