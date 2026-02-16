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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateOrganization } from '@/lib/queries/useOrganizations';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  description: yup.string().default(''),
});

type FormData = yup.InferType<typeof schema>;

export default function CreateOrgDialog() {
  const [open, setOpen] = useState(false);
  const createOrg = useCreateOrganization();
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
      await createOrg.mutateAsync(data);
      toast.success('Organization created. Add members to get started.');
      reset();
      setOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to create organization'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Organization</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} placeholder="Organization name" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} placeholder="Description (optional)" />
          </div>
          <Button type="submit" className="w-full" disabled={createOrg.isPending}>
            {createOrg.isPending ? 'Creating...' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
