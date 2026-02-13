'use client';

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganizations } from '@/lib/queries/useOrganizations';
import { useMissions } from '@/lib/queries/useMissions';
import { useUsers } from '@/lib/queries/useUsers';
import { useCurrentUser } from '@/lib/queries/useUsers';
import { isAdmin, getStoredUser } from '@/lib/auth';

export default function DashboardPage() {
  const { data: orgs } = useOrganizations();
  const { data: missions } = useMissions();
  const { data: users } = useUsers();
  const { data: currentUser } = useCurrentUser();
  const effectiveUser = currentUser || getStoredUser();

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{orgs?.length ?? '—'}</p>
            <p className="text-sm text-gray-500">Total organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{missions?.length ?? '—'}</p>
            <p className="text-sm text-gray-500">Total missions</p>
          </CardContent>
        </Card>

        {isAdmin(effectiveUser) && (
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{users?.length ?? '—'}</p>
              <p className="text-sm text-gray-500">Total users</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
