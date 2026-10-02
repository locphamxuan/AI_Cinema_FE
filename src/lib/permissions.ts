/**
 * Permission keys the backend checks (AI_Cinema_BE src/common/auth/permissions.ts).
 * Which role holds which key is edited by the Admin; the web only reads the list
 * the backend returns for the signed-in account.
 */
export const PERMISSION = {
  // MF-1 — movie projects
  PROJECT_MANAGE: 'project:manage',
  PROJECT_FEE_ALLOCATE: 'project:fee.allocate',
  PROJECT_READ_ALL: 'project:read.all',
  PROJECT_SUGGEST: 'project:suggest',
  STUDIO_HANDOFF: 'studio:handoff',
  MEDIA_INGEST: 'media:ingest',
  CONTENT_REVIEW: 'content:review',
  EPISODE_PUBLISH: 'episode:publish',
  PRICE_ALERT_MANAGE: 'price-alert:manage',
  GENRE_MANAGE: 'genre:manage',
  // Administration
  MEMBER_OPS_READ: 'member:ops.read',
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
  // The Admin oversees every project and proposes changes (BR-55); actions follow permissions.
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
