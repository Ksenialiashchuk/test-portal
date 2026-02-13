'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Organization, StrapiUser } from '@/types';

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await api.get('/api/organizations?populate[0]=manager&populate[1]=members');
      return res.data.data as Organization[];
    },
  });
}

export function useOrganization(documentId: string) {
  return useQuery({
    queryKey: ['organization', documentId],
    queryFn: async () => {
      const res = await api.get(`/api/organizations/${documentId}?populate[0]=manager&populate[1]=members`);
      return res.data.data as Organization;
    },
    enabled: !!documentId,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; manager?: number }) => {
      const res = await api.post('/api/organizations', { data });
      return res.data.data as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useOrgMembers(orgId: string) {
  return useQuery({
    queryKey: ['org-members', orgId],
    queryFn: async () => {
      const res = await api.get(`/api/organizations/${orgId}/members`);
      return res.data.data as { members: StrapiUser[]; manager: StrapiUser | null };
    },
    enabled: !!orgId,
  });
}

export function useAddOrgMember(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await api.post(`/api/organizations/${orgId}/members`, { userId });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', orgId] });
      queryClient.invalidateQueries({ queryKey: ['organization', orgId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useSetOrgManager(orgDocumentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await api.put(`/api/organizations/${orgDocumentId}`, {
        data: { manager: userId },
      });
      return res.data.data as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', orgDocumentId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useRemoveOrgMember(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      await api.delete(`/api/organizations/${orgId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', orgId] });
      queryClient.invalidateQueries({ queryKey: ['organization', orgId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}
