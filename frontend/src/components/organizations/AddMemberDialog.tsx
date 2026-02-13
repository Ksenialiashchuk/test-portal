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
import { useAddOrgMember } from '@/lib/queries/useOrganizations';
import type { StrapiUser } from '@/types';
import { toast } from 'sonner';

interface AddMemberDialogProps {
  orgDocumentId: string;
  existingMemberIds: number[];
}

export default function AddMemberDialog({ orgDocumentId, existingMemberIds }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { data: users } = useUsers();
  const addMember = useAddOrgMember(orgDocumentId);

  const availableUsers = (users || []).filter(
    (u: StrapiUser) => !existingMemberIds.includes(u.id)
  );

  const handleAdd = async () => {
    if (!selectedUserId) return;
    try {
      await addMember.mutateAsync(parseInt(selectedUserId, 10));
      toast.success('Member added successfully');
      setSelectedUserId('');
      setOpen(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(axiosErr.response?.data?.error?.message || 'Failed to add member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member to Organization</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
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
          <Button onClick={handleAdd} disabled={!selectedUserId || addMember.isPending} className="w-full">
            {addMember.isPending ? 'Adding...' : 'Add Member'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
