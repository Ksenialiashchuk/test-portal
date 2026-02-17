export interface StrapiRole {
  id: number;
  name: string;
  description: string;
  type: string;
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  role?: StrapiRole;
}

export type OrganizationRole = 'manager' | 'employee';

export interface OrganizationMember {
  id: number;
  documentId?: string;
  user: StrapiUser;
  organization?: Organization;
  role: OrganizationRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  id: number;
  documentId: string;
  name: string;
  description: string | null;
  organizationMembers?: OrganizationMember[];
  createdAt: string;
  updatedAt: string;
}

export interface MissionUser {
  id: number;
  documentId: string;
  user: StrapiUser;
  mission: Mission;
  status: 'assigned' | 'in_progress' | 'completed';
  assignedAt: string;
  completedAt?: string;
}

export interface Mission {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  organization?: Organization;
  missionUsers?: MissionUser[];
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  mission: Mission;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  jwt: string;
  user: StrapiUser;
}
