'use client';

import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useMissions } from '@/lib/queries/useMissions';
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
import CreateMissionDialog from '@/components/missions/CreateMissionDialog';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default function MissionsPage() {
  const { data: currentUser } = useCurrentUser();
  const effectiveUser = currentUser || getStoredUser();
  const canManage = isAdmin(effectiveUser) || isManager(effectiveUser);
  const { data: missions = [], isLoading, error } = useMissions();

  return (
    <AppLayout allowedRoles={['Admin', 'Manager', 'Authenticated']}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {canManage ? 'Missions' : 'My Missions'}
        </h1>
        {canManage && <CreateMissionDialog />}
      </div>

      {isLoading && <p>Loading missions...</p>}
      {error && <p className="text-red-500">Error loading missions</p>}

      {!isLoading && (
        <div className="bg-white rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    {canManage ? 'No missions yet' : 'You are not assigned to any missions yet'}
                  </TableCell>
                </TableRow>
              )}
              {missions.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell className="font-medium">{mission.title}</TableCell>
                  <TableCell>{mission.description || '—'}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[mission.status] || ''}>
                      {mission.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(mission.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/missions/${mission.documentId}`}
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
