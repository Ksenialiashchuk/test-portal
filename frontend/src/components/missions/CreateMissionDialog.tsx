'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateMission } from '@/lib/queries/useMissions';
import { useCurrentUser } from '@/lib/queries/useUsers';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().default(''),
});

type FormData = yup.InferType<typeof schema>;

export default function CreateMissionDialog() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('draft');
  const createMission = useCreateMission();
  const { data: currentUser } = useCurrentUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const mission = await createMission.mutateAsync({ ...data, status });
      if (currentUser?.id && mission?.documentId) {
        try {
          await api.post(`/api/missions/${mission.documentId}/assign`, {
            userId: currentUser.id,
          });
        } catch {
          // mission created but self-assign failed; user can add themselves later
        }
      }
      toast.success('Mission created');
      reset();
      setStatus('draft');
      setOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to create mission'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Mission</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Mission</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} placeholder="Mission title" />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} placeholder="Description (optional)" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={createMission.isPending}>
            {createMission.isPending ? 'Creating...' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
