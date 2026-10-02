import { useAppStore } from '@/store/useAppStore';
import { PERMISSION } from '@/lib/permissions';
import type { WebRole } from '@/lib/permissions';

/** The permissions the backend seeds for each role (AI_Cinema_BE DEFAULT_ROLE_PERMISSIONS). */
const DEFAULTS: Partial<Record<WebRole, string[]>> = {
  creator: [PERMISSION.STUDIO_HANDOFF, PERMISSION.MEDIA_INGEST],
  reviewer: [
    PERMISSION.PROJECT_MANAGE,
    PERMISSION.PROJECT_FEE_ALLOCATE,
    PERMISSION.CONTENT_REVIEW,
    PERMISSION.EPISODE_PUBLISH,
    PERMISSION.GENRE_MANAGE,
    PERMISSION.USER_READ,
  ],
  staff: [PERMISSION.MEMBER_OPS_READ],
  admin: [
    PERMISSION.PROJECT_READ_ALL,
    PERMISSION.PROJECT_SUGGEST,
    PERMISSION.PRICE_ALERT_MANAGE,
    PERMISSION.GENRE_MANAGE,
    PERMISSION.USER_READ,
    PERMISSION.USER_MANAGE,
    PERMISSION.ROLE_MANAGE,
    PERMISSION.PLATFORM_SETTINGS_MANAGE,
    PERMISSION.TOKEN_BUDGET_MANAGE,
  ],
};

/** Puts a signed-in account of `role` in the app store, with that role's default permissions. */
export function signInAs(role: WebRole, permissions = DEFAULTS[role] ?? []) {
  useAppStore.setState({
    isAuthenticated: true,
    user: { id: `${role}-id`, name: `Test ${role}`, email: `${role}@test.vn`, avatarUrl: '', role, isVIP: true, permissions },
  });
}
