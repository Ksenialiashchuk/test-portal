'use client';

import { useCurrentUser } from '@/lib/queries/useUsers';
import { logout, getStoredUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { data: user } = useCurrentUser();

  const effectiveUser = user || getStoredUser();

  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome, {effectiveUser?.username || 'User'}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          Role: {effectiveUser?.role?.name || 'N/A'}
        </span>
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
