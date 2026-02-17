import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Mission } from '../types';

export function useMissions() {
  return useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const res = await api.get('/api/missions?populate[organization]=*&populate[missionUsers][populate][0]=user');
      return res.data.data as Mission[];
    },
  });
}

export function useMission(documentId: string) {
  return useQuery({
    queryKey: ['mission', documentId],
    queryFn: async () => {
      const res = await api.get(`/api/missions/${documentId}?populate[organization]=*&populate[missionUsers][populate][0]=user&populate[tasks]=*`);
      return res.data.data as Mission;
    },
    enabled: !!documentId,
  });
}

export function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; organization?: number }) => {
      const res = await api.post('/api/missions', { data });
      return res.data.data as Mission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
}
