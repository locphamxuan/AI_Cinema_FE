import { useAppStore } from '@/store/useAppStore';
import { PERMISSION } from '@/lib/permissions';
import type { WebRole } from '@/lib/permissions';

/** The permissions the backend seeds for each role (AI-_Cinema_BE DEFAULT_ROLE_PERMISSIONS). */
const DEFAULTS: Partial<Record<WebRole, string[]>> = {
  creator: [PERMISSION.PRODUCTION_READ, PERMISSION.MILESTONE_UPDATE, PERMISSION.PLAN_WRITE, PERMISSION.QUOTA_REQUEST, PERMISSION.PRODUCTION_GENERATE, PERMISSION.EPISODE_SUBMIT],
  reviewer: [
    PERMISSION.PRODUCTION_READ,
    PERMISSION.PROJECT_MANAGE,
    PERMISSION.MILESTONE_UPDATE,
    PERMISSION.PLAN_REVIEW,
    PERMISSION.QUOTA_MANAGE,
    PERMISSION.EPISODE_REVIEW,
    PERMISSION.MOVIE_PUBLISH,
    PERMISSION.GENRE_MANAGE,
    PERMISSION.GENRE_STYLE_MANAGE,
    PERMISSION.USER_READ,
  ],
  staff: [PERMISSION.FILM_ANALYTICS_READ, PERMISSION.MEMBER_OPS_READ, PERMISSION.BILLING_READ, PERMISSION.SUPPORT_MANAGE, PERMISSION.MARKETING_MANAGE],
  admin: [
    PERMISSION.PRODUCTION_READ,
    PERMISSION.FILM_ANALYTICS_READ,
    PERMISSION.MEMBER_OPS_READ,
    PERMISSION.BILLING_READ,
    PERMISSION.SUPPORT_MANAGE,
    PERMISSION.MARKETING_MANAGE,
    PERMISSION.USER_READ,
    PERMISSION.USER_MANAGE,
    PERMISSION.ROLE_MANAGE,
    PERMISSION.PLATFORM_SETTINGS_MANAGE,
  ],
};

/** Puts a signed-in account of `role` in the app store, with that role's default permissions. */
export function signInAs(role: WebRole, permissions = DEFAULTS[role] ?? []) {
  useAppStore.setState({
    isAuthenticated: true,
    user: { id: `${role}-id`, name: `Test ${role}`, email: `${role}@test.vn`, avatarUrl: '', role, isVIP: true, permissions },
  });
}
