import {
  BadgeAlert,
  Bell,
  HandCoins,
  BarChart3,
  Clapperboard,
  Coins,
  CreditCard,
  Film,
  Gift,
  KeyRound,
  MessageSquareWarning,
  Receipt,
  Settings,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
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
  { href: '/admin/change-requests', label: 'Đề xuất chờ duyệt', icon: MessageSquareWarning, permission: PERMISSION.PROJECT_CHANGE_REVIEW },
  { href: '/admin/token-requests', label: 'Creator xin thêm Token', icon: HandCoins, permission: PERMISSION.PROJECT_CHANGE_REVIEW },
  { href: '/admin/notifications', label: 'Thông báo', icon: Bell, permission: PERMISSION.PROJECT_READ_ALL },
  { href: '/admin/movies', label: 'Phim đã phát hành', icon: Film, permission: PERMISSION.PROJECT_READ_ALL },
  { href: '/admin/reviewer-tokens', label: 'Token Reviewer', icon: Coins, permission: PERMISSION.TOKEN_BUDGET_MANAGE },
  { href: '/admin/price-alerts', label: 'Cảnh báo giá', icon: BadgeAlert, permission: PERMISSION.PRICE_ALERT_MANAGE },
  { href: '/admin/membership-plans', label: 'Gói thành viên', icon: CreditCard, permission: PERMISSION.BILLING_PLAN_MANAGE },
  { href: '/admin/subscriptions', label: 'Đăng ký gói', icon: UserCheck, permission: PERMISSION.BILLING_SUBSCRIPTION_READ },
  { href: '/admin/coin-transactions', label: 'Giao dịch Coin', icon: Receipt, permission: PERMISSION.COIN_TRANSACTION_READ },
  { href: '/admin/rewards', label: 'Điểm danh & vòng quay', icon: Gift, permission: PERMISSION.REWARD_RULE_MANAGE },
  { href: '/admin/billing-reports', label: 'Báo cáo gói', icon: BarChart3, permission: PERMISSION.ANALYTICS_REVENUE_READ },
  { href: '/admin/settings', label: 'Cài đặt nền tảng', icon: Settings, permission: PERMISSION.PLATFORM_SETTINGS_MANAGE },
];
