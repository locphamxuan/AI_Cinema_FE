import { BadgeAlert, Clapperboard, Coins, Film, KeyRound, Settings, Users, type LucideIcon } from 'lucide-react';
import { PERMISSION, type PermissionKey } from '@/lib/permissions';

export interface AdminSection {
  href: string;
  label: string;
  icon: LucideIcon;
  /** The section shows only to accounts holding it. */
  permission: PermissionKey;
}

/** The Admin console, one page per section, in sidebar order. */
export const ADMIN_SECTIONS: AdminSection[] = [
  { href: '/admin/accounts', label: 'Tài khoản', icon: Users, permission: PERMISSION.USER_READ },
  { href: '/admin/permissions', label: 'Phân quyền', icon: KeyRound, permission: PERMISSION.ROLE_MANAGE },
  { href: '/admin/projects', label: 'Dự án phim', icon: Clapperboard, permission: PERMISSION.PROJECT_READ_ALL },
  { href: '/admin/movies', label: 'Phim đã phát hành', icon: Film, permission: PERMISSION.PROJECT_READ_ALL },
  { href: '/admin/reviewer-tokens', label: 'Token Reviewer', icon: Coins, permission: PERMISSION.TOKEN_BUDGET_MANAGE },
  { href: '/admin/price-alerts', label: 'Cảnh báo giá', icon: BadgeAlert, permission: PERMISSION.PRICE_ALERT_MANAGE },
  { href: '/admin/settings', label: 'Cài đặt nền tảng', icon: Settings, permission: PERMISSION.PLATFORM_SETTINGS_MANAGE },
];
