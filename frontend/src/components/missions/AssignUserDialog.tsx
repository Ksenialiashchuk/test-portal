'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/lib/queries/useUsers';
import { useOrganizations } from '@/lib/queries/useOrganizations';
import { useAssignUserToMission, useAssignOrgToMission } from '@/lib/queries/useMissions';
import type { StrapiUser, MissionUser, Organization } from '@/types';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';

type Tab = 'user' | 'organization';

interface AssignUserDialogProps {
  missionDocumentId: string;
  existingParticipants: MissionUser[];
}

export default function AssignUserDialog({ missionDocumentId, existingParticipants }: AssignUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('user');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const { data: users } = useUsers();
  const { data: organizations } = useOrganizations();
  const assignUser = useAssignUserToMission(missionDocumentId);
  const assignOrg = useAssignOrgToMission(missionDocumentId);

  const assignedUserIds = existingParticipants.map((p) => p.user?.id).filter(Boolean);
  const availableUsers = (users || []).filter(
    (u: StrapiUser) => !assignedUserIds.includes(u.id)
  );

  const handleAssignUser = async () => {
    if (!selectedUserId) return;
    try {
      await assignUser.mutateAsync(parseInt(selectedUserId, 10));
      toast.success('User assigned to mission');
      setSelectedUserId('');
      setOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to assign user'));
    }
  };

  const handleAssignOrg = async () => {
    if (!selectedOrgId) return;
    try {
      const result = await assignOrg.mutateAsync(selectedOrgId);
      toast.success(result.message);
      setSelectedOrgId('');
      setOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to assign organization'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Participant</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign to Mission</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Button
              variant={tab === 'user' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab('user')}
              type="button"
            >
              Add User
            </Button>
            <Button
              variant={tab === 'organization' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab('organization')}
              type="button"
            >
              Add Organization
            </Button>
          </div>

          {tab === 'user' && (
            <>
              <p className="text-sm text-gray-500">
                Assign an individual user from any organization to this mission.
              </p>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((u: StrapiUser) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.username} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAssignUser}
                disabled={!selectedUserId || assignUser.isPending}
                className="w-full"
              >
                {assignUser.isPending ? 'Assigning...' : 'Assign User'}
              </Button>
            </>
          )}

          {tab === 'organization' && (
            <>
              <p className="text-sm text-gray-500">
                Assign all members of an organization to this mission at once.
              </p>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an organization..." />
                </SelectTrigger>
                <SelectContent>
                  {(organizations || []).map((org: Organization) => (
                    <SelectItem key={org.documentId} value={org.documentId}>
                      {org.name} ({org.organizationMembers?.length || 0} members)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAssignOrg}
                disabled={!selectedOrgId || assignOrg.isPending}
                className="w-full"
              >
                {assignOrg.isPending ? 'Assigning...' : 'Assign Organization'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
