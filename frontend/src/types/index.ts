export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  role?: StrapiRole;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiRole {
  id: number;
  name: string;
  description: string;
  type: string;
}

export interface Organization {
  id: number;
  documentId: string;
  name: string;
  description: string | null;
  manager: StrapiUser | null;
  members: StrapiUser[];
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  type: 'quiz' | 'survey' | 'action' | 'other';
  order: number;
  mission?: Mission;
  createdAt: string;
  updatedAt: string;
}

export interface MissionUser {
  id: number;
  documentId: string;
  mission: Mission;
  user: StrapiUser;
  status: 'assigned' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  jwt: string;
  user: StrapiUser;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}
