'use client';

import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useOrganizations } from '@/lib/queries/useOrganizations';
import { useCurrentUser } from '@/lib/queries/useUsers';
import { isAdmin, isManager, getStoredUser } from '@/lib/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import CreateOrgDialog from '@/components/organizations/CreateOrgDialog';

export default function OrganizationsPage() {
  const { data: allOrganizations, isLoading, error } = useOrganizations();
  const { data: currentUser } = useCurrentUser();
  const effectiveUser = currentUser || getStoredUser();

  let organizations = allOrganizations;
  if (!isAdmin(effectiveUser)) {
    organizations = allOrganizations?.filter(
      (org) =>
        org.manager?.id === effectiveUser?.id ||
        org.members?.some((m) => m.id === effectiveUser?.id)
    );
  }

  return (
    <AppLayout allowedRoles={['Admin', 'Manager', 'Authenticated']}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Organizations</h1>
        {isAdmin(effectiveUser) && <CreateOrgDialog />}
      </div>

      {isLoading && <p>Loading organizations...</p>}
      {error && <p className="text-red-500">Error loading organizations</p>}

      {organizations && (
        <div className="bg-white rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No organizations yet
                  </TableCell>
                </TableRow>
              )}
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>{org.description || '—'}</TableCell>
                  <TableCell>
                    {org.manager ? (
                      <Badge variant="secondary">{org.manager.username}</Badge>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge>{org.members?.length || 0} members</Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/organizations/${org.documentId}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppLayout>
  );
}
