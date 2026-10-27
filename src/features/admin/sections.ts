import {
  BarChart3,
  Bell,
  Clapperboard,
  CreditCard,
  Film,
  Gift,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PERMISSION, type PermissionKey } from '@/lib/permissions';

export interface AdminSection {
  href: string;
  label: string;
  icon: LucideIcon;
  /** The section shows to accounts holding any of these; a section of several tabs needs one per tab. */
  permissions: PermissionKey[];
}

/** The Admin console in sidebar order: overview, production, money, then people and settings. */
export const ADMIN_SECTIONS: AdminSection[] = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, permissions: [PERMISSION.PROJECT_READ_ALL] },
  { href: '/admin/projects', label: 'Dự án phim', icon: Clapperboard, permissions: [PERMISSION.PROJECT_READ_ALL] },
  {
    href: '/admin/requests',
    label: 'Duyệt yêu cầu',
    icon: Inbox,
    permissions: [PERMISSION.PROJECT_CHANGE_REVIEW, PERMISSION.TOKEN_BUDGET_MANAGE],
  },
  { href: '/admin/movies', label: 'Quản lý phim', icon: Film, permissions: [PERMISSION.PROJECT_READ_ALL] },
  { href: '/admin/ads', label: 'Quảng cáo', icon: Megaphone, permissions: [PERMISSION.AD_MANAGE] },
  {
    href: '/admin/membership-plans',
    label: 'Gói thành viên',
    icon: CreditCard,
    permissions: [PERMISSION.BILLING_PLAN_MANAGE, PERMISSION.BILLING_SUBSCRIPTION_READ],
  },
  { href: '/admin/coin-transactions', label: 'Giao dịch Coin', icon: Receipt, permissions: [PERMISSION.COIN_TRANSACTION_READ] },
  { href: '/admin/rewards', label: 'Điểm danh & vòng quay', icon: Gift, permissions: [PERMISSION.REWARD_RULE_MANAGE] },
  { href: '/admin/billing-reports', label: 'Báo cáo doanh thu gói', icon: BarChart3, permissions: [PERMISSION.ANALYTICS_REVENUE_READ] },
  { href: '/admin/accounts', label: 'Tài khoản', icon: Users, permissions: [PERMISSION.USER_READ] },
  { href: '/admin/permissions', label: 'Phân quyền', icon: KeyRound, permissions: [PERMISSION.ROLE_MANAGE] },
  { href: '/admin/notifications', label: 'Thông báo', icon: Bell, permissions: [PERMISSION.PROJECT_READ_ALL] },
  {
    href: '/admin/settings',
    label: 'Cài đặt nền tảng',
    icon: Settings,
    permissions: [PERMISSION.PLATFORM_SETTINGS_MANAGE, PERMISSION.PRICE_ALERT_MANAGE],
  },
];

/** Whether the account may open the section. */
export const opensSection = (section: AdminSection, can: (p: PermissionKey) => boolean) => section.permissions.some(can);
