import api from './api';
import type { AuthResponse, StrapiUser } from '@/types';

export async function login(identifier: string, password: string): Promise<AuthResponse> {
  const response = await api.post('/api/auth/local', {
    identifier,
    password,
  });
  const data = response.data as AuthResponse;

  localStorage.setItem('jwt', data.jwt);
  try {
    const meResponse = await api.get('/api/users/me');
    const userWithRole = meResponse.data as StrapiUser;
    localStorage.setItem('user', JSON.stringify(userWithRole));
    data.user = userWithRole;
  } catch {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

export function logout() {
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function getStoredUser(): StrapiUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function fetchCurrentUser(): Promise<StrapiUser | null> {
  try {
    const response = await api.get('/api/users/me');
    return response.data;
  } catch {
    return null;
  }
}

export function hasRole(user: StrapiUser | null, roleName: string): boolean {
  if (!user?.role) return false;
  return user.role.name === roleName;
}

export function isAdmin(user: StrapiUser | null): boolean {
  return hasRole(user, 'Admin');
}

export function isManager(user: StrapiUser | null): boolean {
  return hasRole(user, 'Manager') || hasRole(user, 'Admin');
}
