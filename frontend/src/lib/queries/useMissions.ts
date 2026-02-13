'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Mission, MissionUser } from '@/types';

export function useMissions() {
  return useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const res = await api.get('/api/missions');
      return res.data.data as Mission[];
    },
  });
}

export function useMission(documentId: string) {
  return useQuery({
    queryKey: ['mission', documentId],
    queryFn: async () => {
      const res = await api.get(`/api/missions/${documentId}`);
      return res.data.data as Mission;
    },
    enabled: !!documentId,
  });
}

export function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; status?: string }) => {
      const res = await api.post('/api/missions', { data });
      return res.data.data as Mission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
}

export function useUpdateMission(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { status?: string; title?: string; description?: string }) => {
      const res = await api.put(`/api/missions/${documentId}`, { data });
      return res.data.data as Mission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission', documentId] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
}

export function useMissionParticipants(missionDocumentId: string) {
  return useQuery({
    queryKey: ['mission-participants', missionDocumentId],
    queryFn: async () => {
      const res = await api.get(`/api/missions/${missionDocumentId}/participants`);
      return res.data.data as MissionUser[];
    },
    enabled: !!missionDocumentId,
  });
}

export function useAssignUserToMission(missionDocumentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await api.post(`/api/missions/${missionDocumentId}/assign`, { userId });
      return res.data.data as MissionUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-participants', missionDocumentId] });
    },
  });
}

export function useMyMissionAssignments(userId: number | undefined) {
  return useQuery({
    queryKey: ['my-mission-assignments', userId],
    queryFn: async () => {
      const res = await api.get(
        `/api/mission-users?filters[user][id][$eq]=${userId}&populate[0]=mission&populate[1]=user`
      );
      return res.data.data as MissionUser[];
    },
    enabled: !!userId,
  });
}

export function useAssignOrgToMission(missionDocumentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const res = await api.post(`/api/missions/${missionDocumentId}/assign-organization`, {
        organizationId,
      });
      return res.data.data as { message: string; addedCount: number; totalMembers: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-participants', missionDocumentId] });
    },
  });
}

export function useRemoveMissionParticipant(missionDocumentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      await api.delete(`/api/missions/${missionDocumentId}/participants/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-participants', missionDocumentId] });
    },
  });
}
