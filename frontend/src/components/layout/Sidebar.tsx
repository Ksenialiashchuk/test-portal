'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/lib/queries/useUsers';
import { isAdmin, getStoredUser } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', roles: ['Admin', 'Manager', 'Reporter', 'Authenticated'] },
  { href: '/organizations', label: 'Organizations', roles: ['Admin', 'Manager', 'Authenticated'] },
  { href: '/missions', label: 'Missions', roles: ['Admin', 'Manager', 'Authenticated'] },
  { href: '/users', label: 'Users', roles: ['Admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();

  const storedUser = getStoredUser();
  const effectiveUser = user || storedUser;
  const userRole = effectiveUser?.role?.name || '';

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 relative">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Loyalty Portal</h1>
        <p className="text-sm text-gray-400 mt-1">POC Demo</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          if (userRole) {
            if (!item.roles.includes(userRole) && !isAdmin(effectiveUser)) {
              return null;
            }
          }

          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {effectiveUser && (
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-gray-800 rounded-md">
          <p className="text-sm font-medium truncate">{effectiveUser.username}</p>
          <p className="text-xs text-gray-400">{effectiveUser.role?.name || 'No role'}</p>
        </div>
      )}
    </aside>
  );
}
