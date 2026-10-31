import { PERMISSION, type PermissionKey } from '@/lib/permissions';

export interface AdminSection {
  href: string;
  label: string;
  /** The section shows to accounts holding any of these; a section of several tabs needs one per tab. */
  permissions: PermissionKey[];
}

/** The Admin console in sidebar order: overview, production, money, then people and settings. */
export const ADMIN_SECTIONS: AdminSection[] = [
  { href: '/admin', label: 'Tổng quan', permissions: [PERMISSION.PROJECT_READ_ALL] },
  { href: '/admin/projects', label: 'Dự án phim', permissions: [PERMISSION.PROJECT_READ_ALL] },
  {
    href: '/admin/requests',
    label: 'Duyệt yêu cầu',
    permissions: [PERMISSION.PROJECT_CHANGE_REVIEW, PERMISSION.TOKEN_BUDGET_MANAGE],
  },
  { href: '/admin/movies', label: 'Quản lý phim', permissions: [PERMISSION.PROJECT_READ_ALL] },
  { href: '/admin/ads', label: 'Quảng cáo', permissions: [PERMISSION.AD_MANAGE] },
  {
    href: '/admin/membership-plans',
    label: 'Gói thành viên & Doanh thu',
    permissions: [
      PERMISSION.BILLING_PLAN_MANAGE,
      PERMISSION.BILLING_SUBSCRIPTION_READ,
      PERMISSION.ANALYTICS_REVENUE_READ,
    ],
  },
  { href: '/admin/coin-transactions', label: 'Giao dịch Coin', permissions: [PERMISSION.COIN_TRANSACTION_READ] },
  { href: '/admin/rewards', label: 'Điểm danh & vòng quay', permissions: [PERMISSION.REWARD_RULE_MANAGE] },
  {
    href: '/admin/permissions',
    label: 'Tài khoản & Phân quyền',
    permissions: [PERMISSION.USER_READ, PERMISSION.ROLE_MANAGE],
  },
  { href: '/admin/notifications', label: 'Thông báo', permissions: [PERMISSION.PROJECT_READ_ALL] },
  {
    href: '/admin/settings',
    label: 'Cài đặt nền tảng',
    permissions: [PERMISSION.PLATFORM_SETTINGS_MANAGE, PERMISSION.PRICE_ALERT_MANAGE],
  },
];

/** Whether the account may open the section. */
export const opensSection = (section: AdminSection, can: (p: PermissionKey) => boolean) =>
  section.permissions.some(can);
