'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useOrganization, useRemoveOrgMember } from '@/lib/queries/useOrganizations';
import { useCurrentUser } from '@/lib/queries/useUsers';
import { isAdmin, getStoredUser } from '@/lib/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddMemberDialog from '@/components/organizations/AddMemberDialog';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';

export default function OrganizationDetailPage() {
  const params = useParams();
  const documentId = params.id as string;
  const { data: org, isLoading, error } = useOrganization(documentId);
  const { data: currentUser } = useCurrentUser();
  const effectiveUser = currentUser || getStoredUser();
  const removeMember = useRemoveOrgMember(documentId);

  const isOrgManager = org?.organizationMembers?.some(
    (om) => om.user.id === effectiveUser?.id && om.role === 'manager'
  );
  const canManage = isAdmin(effectiveUser) || isOrgManager;
  const adminOnly = isAdmin(effectiveUser);

  const managers = org?.organizationMembers?.filter((om) => om.role === 'manager') || [];
  const allMembers = org?.organizationMembers || [];
  const existingMemberIds = allMembers.map((om) => om.user.id);

  const handleRemoveMember = async (userId: number) => {
    try {
      await removeMember.mutateAsync(userId);
      toast.success('Member removed');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to remove member'));
    }
  };

  return (
    <AppLayout allowedRoles={['Admin', 'Manager', 'Authenticated']}>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error loading organization</p>}

      {org && (
        <>
          <div className="mb-6">
            <Link
              href="/organizations"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              &larr; Back to Organizations
            </Link>
            <h1 className="text-2xl font-bold">{org.name}</h1>
            {org.description && <p className="text-gray-500 mt-1">{org.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Managers</CardTitle>
              </CardHeader>
              <CardContent>
                {managers.length > 0 ? (
                  <div className="space-y-2">
                    {managers.map((om) => (
                      <div key={om.user.id}>
                        <p className="font-medium">{om.user.username}</p>
                        <p className="text-sm text-gray-500">{om.user.email}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No managers assigned</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{allMembers.length}</p>
                <p className="text-sm text-gray-500">Total Members</p>
                <div className="mt-3 text-sm text-gray-600">
                  <p>{managers.length} Manager{managers.length !== 1 ? 's' : ''}</p>
                  <p>{allMembers.length - managers.length} Employee{allMembers.length - managers.length !== 1 ? 's' : ''}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Members</h2>
            {canManage && (
              <AddMemberDialog
                orgDocumentId={documentId}
                existingMemberIds={existingMemberIds}
              />
            )}
          </div>

          <div className="bg-white rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  {canManage && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 4 : 3} className="text-center text-gray-500">
                      No members yet
                    </TableCell>
                  </TableRow>
                )}
                {allMembers.map((om) => (
                  <TableRow key={om.user.id}>
                    <TableCell className="font-medium">{om.user.username}</TableCell>
                    <TableCell>{om.user.email}</TableCell>
                    <TableCell>
                      <Badge variant={om.role === 'manager' ? 'default' : 'secondary'}>
                        {om.role === 'manager' ? 'Manager' : 'Employee'}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMember(om.user.id)}
                          disabled={removeMember.isPending}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </AppLayout>
  );
}
