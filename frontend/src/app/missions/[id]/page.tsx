'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useMission, useUpdateMission, useMissionParticipants, useRemoveMissionParticipant } from '@/lib/queries/useMissions';
import { useMissionTasks, useCreateTask, useDeleteTask } from '@/lib/queries/useTasks';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import AssignUserDialog from '@/components/missions/AssignUserDialog';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  assigned: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
};

const taskTypeLabels: Record<string, string> = {
  quiz: 'Quiz',
  survey: 'Survey',
  action: 'Action',
  other: 'Other',
};

export default function MissionDetailPage() {
  const params = useParams();
  const documentId = params.id as string;
  const { data: mission, isLoading: loadingMission } = useMission(documentId);
  const { data: participants, isLoading: loadingParticipants } = useMissionParticipants(documentId);
  const { data: tasks, isLoading: loadingTasks } = useMissionTasks(documentId);
  const { data: currentUser } = useCurrentUser();
  const effectiveUser = currentUser || getStoredUser();
  const removeParticipant = useRemoveMissionParticipant(documentId);
  const updateMission = useUpdateMission(documentId);
  const createTask = useCreateTask(documentId);
  const deleteTask = useDeleteTask(documentId);

  const canManage = isAdmin(effectiveUser) || isManager(effectiveUser);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskType, setNewTaskType] = useState('quiz');

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateMission.mutateAsync({ status: newStatus });
      toast.success(`Status changed to ${newStatus}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update status'));
    }
  };

  const handleRemove = async (userId: number) => {
    try {
      await removeParticipant.mutateAsync(userId);
      toast.success('Participant removed');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to remove participant'));
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !mission) return;
    try {
      await createTask.mutateAsync({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        type: newTaskType,
        order: (tasks?.length || 0) + 1,
        mission: mission.id,
      });
      toast.success('Task added');
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskType('quiz');
      setTaskDialogOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create task'));
    }
  };

  const handleDeleteTask = async (taskDocId: string) => {
    try {
      await deleteTask.mutateAsync(taskDocId);
      toast.success('Task removed');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to remove task'));
    }
  };

  return (
    <AppLayout allowedRoles={['Admin', 'Manager', 'Authenticated']}>
      {loadingMission && <p>Loading...</p>}

      {mission && (
        <>
          <div className="mb-6">
            <Link
              href="/missions"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              &larr; Back to Missions
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{mission.title}</h1>
              <Badge className={statusColors[mission.status] || ''}>
                {mission.status}
              </Badge>
            </div>
            {mission.description && <p className="text-gray-500 mt-1">{mission.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Mission Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Created: {new Date(mission.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Status:</p>
                  {canManage ? (
                    <Select
                      value={mission.status}
                      onValueChange={handleStatusChange}
                      disabled={updateMission.isPending}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={statusColors[mission.status] || ''}>
                      {mission.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{tasks?.length || 0}</p>
                <p className="text-sm text-gray-500">Tasks in this mission</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{participants?.length || 0}</p>
                <p className="text-sm text-gray-500">Assigned users</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Tasks (Quest Chain)</h2>
            {canManage && (
              <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add Task</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Task to Mission</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Task title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder="Description (optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={newTaskType} onValueChange={setNewTaskType}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="survey">Survey</SelectItem>
                          <SelectItem value="action">Action</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCreateTask}
                      disabled={!newTaskTitle.trim() || createTask.isPending}
                    >
                      {createTask.isPending ? 'Adding...' : 'Add Task'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {loadingTasks && <p>Loading tasks...</p>}

          <div className="bg-white rounded-md border mb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  {canManage && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!tasks || tasks.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 5 : 4} className="text-center text-gray-500">
                      No tasks yet. Add tasks to build the quest chain.
                    </TableCell>
                  </TableRow>
                )}
                {(tasks || []).map((task, index) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-bold text-gray-400">{index + 1}</TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell className="text-sm text-gray-500">{task.description || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{taskTypeLabels[task.type] || task.type}</Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTask(task.documentId)}
                          disabled={deleteTask.isPending}
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

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Participants</h2>
            {canManage && (
              <AssignUserDialog
                missionDocumentId={documentId}
                existingParticipants={participants || []}
              />
            )}
          </div>

          {loadingParticipants && <p>Loading participants...</p>}

          <div className="bg-white rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assignment Status</TableHead>
                  {canManage && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!participants || participants.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 4 : 3} className="text-center text-gray-500">
                      No participants yet
                    </TableCell>
                  </TableRow>
                )}
                {(participants || []).map((mu) => (
                  <TableRow key={mu.id}>
                    <TableCell className="font-medium">{mu.user?.username || 'N/A'}</TableCell>
                    <TableCell>{mu.user?.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[mu.status] || ''}>
                        {mu.status}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => mu.user && handleRemove(mu.user.id)}
                          disabled={removeParticipant.isPending}
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
