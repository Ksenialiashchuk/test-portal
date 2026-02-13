'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useOrganization, useRemoveOrgMember, useSetOrgManager } from '@/lib/queries/useOrganizations';
import { useCurrentUser, useUsers } from '@/lib/queries/useUsers';
import { isAdmin, isManager, getStoredUser } from '@/lib/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const setManager = useSetOrgManager(documentId);
  const { data: allUsers } = useUsers();

  const [editingManager, setEditingManager] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');

  const canManage = isAdmin(effectiveUser) || isManager(effectiveUser);
  const adminOnly = isAdmin(effectiveUser);

  const handleRemoveMember = async (userId: number) => {
    try {
      await removeMember.mutateAsync(userId);
      toast.success('Member removed');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to remove member'));
    }
  };

  const handleSetManager = async () => {
    if (!selectedManagerId) return;
    try {
      await setManager.mutateAsync(Number(selectedManagerId));
      toast.success('Manager updated');
      setEditingManager(false);
      setSelectedManagerId('');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update manager'));
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
                <CardTitle>Manager</CardTitle>
              </CardHeader>
              <CardContent>
                {org.manager ? (
                  <div>
                    <p className="font-medium">{org.manager.username}</p>
                    <p className="text-sm text-gray-500">{org.manager.email}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">No manager assigned</p>
                )}

                {adminOnly && !editingManager && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setSelectedManagerId(org.manager ? String(org.manager.id) : '');
                      setEditingManager(true);
                    }}
                  >
                    {org.manager ? 'Change Manager' : 'Assign Manager'}
                  </Button>
                )}

                {adminOnly && editingManager && (
                  <div className="mt-3 space-y-2">
                    <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(allUsers || [])
                        .filter((u) => u.role?.name === 'Manager')
                        .map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.username} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSetManager}
                        disabled={!selectedManagerId || setManager.isPending}
                      >
                        {setManager.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingManager(false);
                          setSelectedManagerId('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{org.members?.length || 0}</p>
                <p className="text-sm text-gray-500">Members</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Members</h2>
            {canManage && (
              <AddMemberDialog
                orgDocumentId={documentId}
                existingMemberIds={(org.members || []).map((m) => m.id)}
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
                {(!org.members || org.members.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 4 : 3} className="text-center text-gray-500">
                      No members yet
                    </TableCell>
                  </TableRow>
                )}
                {(org.members || []).map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.username}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Member</Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
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
