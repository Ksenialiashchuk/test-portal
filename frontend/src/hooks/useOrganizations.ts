import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Organization, OrganizationMember } from '../types';

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await api.get('/api/organizations?populate[organizationMembers][populate][0]=user');
      return res.data.data as Organization[];
    },
  });
}

export function useOrganization(documentId: string) {
  return useQuery({
    queryKey: ['organization', documentId],
    queryFn: async () => {
      const res = await api.get(`/api/organizations/${documentId}?populate[organizationMembers][populate][0]=user`);
      return res.data.data as Organization;
    },
    enabled: !!documentId,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await api.post('/api/organizations', { data });
      return res.data.data as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useAddOrgMember(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: 'manager' | 'employee' }) => {
      const res = await api.post(`/api/organizations/${orgId}/members`, { userId, role });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', orgId] });
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
      queryClient.invalidateQueries({ queryKey: ['organization', orgId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}
