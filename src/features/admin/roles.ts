import type { UserRole } from '@/types/workflow-api-enums';

export const BACKEND_ROLES: UserRole[] = ['MEMBER', 'CONTENT_CREATOR', 'CONTENT_REVIEWER', 'STAFF', 'ADMIN'];

export const BACKEND_ROLE_LABEL: Record<UserRole, string> = {
  MEMBER: 'Member',
  CONTENT_CREATOR: 'Content Creator',
  CONTENT_REVIEWER: 'Content Reviewer',
  STAFF: 'Staff',
  ADMIN: 'Admin',
};

export const PERMISSION_AREA_LABEL: Record<string, string> = {
  production: 'Sản xuất phim (MF-1)',
  operations: 'Vận hành (MF-5)',
  admin: 'Quản trị',
};
