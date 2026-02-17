import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { StrapiUser } from '../types';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/api/users?populate=role');
      return res.data as StrapiUser[];
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/api/users/me?populate=role');
      return res.data as StrapiUser;
    },
    retry: false,
  });
}
