/**
 * Permission keys the backend checks (AI-_Cinema_BE src/common/auth/permissions.ts).
 * Which role holds which key is edited by the Admin; the web only reads the list
 * the backend returns for the signed-in account.
 */
export const PERMISSION = {
  PRODUCTION_READ: 'production:read',
  PROJECT_MANAGE: 'production:project.manage',
  MILESTONE_UPDATE: 'production:milestone.update',
  PLAN_WRITE: 'production:plan.write',
  PLAN_REVIEW: 'production:plan.review',
  QUOTA_REQUEST: 'production:quota.request',
  QUOTA_MANAGE: 'production:quota.manage',
  PRODUCTION_GENERATE: 'production:generate',
  EPISODE_SUBMIT: 'episode:submit',
  EPISODE_REVIEW: 'episode:review',
  MOVIE_PUBLISH: 'movie:publish',
  GENRE_MANAGE: 'genre:manage',
  GENRE_STYLE_MANAGE: 'genre-style:manage',
  FILM_ANALYTICS_READ: 'film:analytics.read',
  MEMBER_OPS_READ: 'member:ops.read',
  BILLING_READ: 'billing:read',
  SUPPORT_MANAGE: 'support:manage',
  MARKETING_MANAGE: 'marketing:manage',
  USER_READ: 'user:read',
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  PLATFORM_SETTINGS_MANAGE: 'platform:settings.manage',
} as const;

export type PermissionKey = (typeof PERMISSION)[keyof typeof PERMISSION];

/** Web roles (the backend's UserRole, as the web spells it). */
export type WebRole = 'user' | 'vip' | 'creator' | 'reviewer' | 'staff' | 'admin';

/** Internal areas of the web portal and which roles may enter each. */
export type Area = 'creator' | 'reviewer' | 'staff' | 'admin';

export const AREAS: Record<Area, { label: string; path: string; roles: WebRole[] }> = {
  creator: { label: 'Sản xuất nội dung', path: '/creator/projects', roles: ['creator'] },
  // The Admin oversees production read-only (PROJECT_OVERVIEW.md §2.2); actions follow permissions.
  reviewer: { label: 'Kiểm duyệt nội dung', path: '/reviewer', roles: ['reviewer', 'admin'] },
  staff: { label: 'Vận hành', path: '/staff', roles: ['staff', 'admin'] },
  admin: { label: 'Quản trị', path: '/admin', roles: ['admin'] },
};

export const ROLE_LABEL: Record<WebRole, string> = {
  user: 'Member',
  vip: 'Member',
  creator: 'Content Creator',
  reviewer: 'Content Reviewer',
  staff: 'Staff',
  admin: 'Admin',
};

/** Where an account lands after signing in; members stay on the viewer site. */
export function homeAreaOf(role: WebRole | undefined): Area | null {
  switch (role) {
    case 'creator':
      return 'creator';
    case 'reviewer':
      return 'reviewer';
    case 'staff':
      return 'staff';
    case 'admin':
      return 'admin';
    default:
      return null;
  }
}

export function canEnter(area: Area, role: WebRole | undefined): boolean {
  return role !== undefined && AREAS[area].roles.includes(role);
}
