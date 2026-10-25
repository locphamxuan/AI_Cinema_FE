import type { UserRole } from '@/types/production';

export const BACKEND_ROLES: UserRole[] = ['MEMBER', 'CONTENT_CREATOR', 'CONTENT_REVIEWER', 'STAFF', 'ADMIN'];

/** Roles the Admin can create accounts for; members sign up themselves. */
export const STAFF_ROLES: UserRole[] = ['CONTENT_CREATOR', 'CONTENT_REVIEWER', 'STAFF', 'ADMIN'];

export const BACKEND_ROLE_LABEL: Record<UserRole, string> = {
  MEMBER: 'Member',
  CONTENT_CREATOR: 'Content Creator',
  CONTENT_REVIEWER: 'Content Reviewer',
  STAFF: 'Staff',
  ADMIN: 'Admin',
};

export const ROLE_TONE: Record<UserRole, 'purple' | 'emerald' | 'blue' | 'amber' | 'neutral'> = {
  ADMIN: 'purple',
  CONTENT_REVIEWER: 'emerald',
  CONTENT_CREATOR: 'blue',
  STAFF: 'amber',
  MEMBER: 'neutral',
};

/** Groups of the permission catalog (AI_Cinema_BE PERMISSION_CATALOG `area`). */
export const PERMISSION_AREA_LABEL: Record<string, string> = {
  'movie-project': 'Dự án phim (MF-1)',
  studio: 'Studio sản xuất',
  media: 'Giao tập phim',
  review: 'Kiểm duyệt nội dung',
  publishing: 'Phát hành',
  catalog: 'Danh mục',
  advertising: 'Quảng cáo (MF-3)',
  administration: 'Quản trị',
};
