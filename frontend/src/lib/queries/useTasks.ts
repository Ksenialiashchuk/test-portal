'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Task } from '@/types';

export function useMissionTasks(missionDocumentId: string) {
  return useQuery({
    queryKey: ['mission-tasks', missionDocumentId],
    queryFn: async () => {
      const res = await api.get(
        `/api/tasks?filters[mission][documentId][$eq]=${missionDocumentId}&sort=order:asc`
      );
      return res.data.data as Task[];
    },
    enabled: !!missionDocumentId,
  });
}

export function useCreateTask(missionDocumentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      type: string;
      order: number;
      mission: number;
    }) => {
      const res = await api.post('/api/tasks', { data });
      return res.data.data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionDocumentId] });
    },
  });
}

export function useDeleteTask(missionDocumentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskDocumentId: string) => {
      await api.delete(`/api/tasks/${taskDocumentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionDocumentId] });
    },
  });
}
