import {
  Bell,
  BookOpenCheck,
  Bot,
  Building2,
  Clapperboard,
  Coins,
  FileCheck2,
  FilePenLine,
  FolderKanban,
  Gift,
  Headset,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MonitorPlay,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { PERMISSION, type Area, type PermissionKey } from '@/lib/permissions';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown only to accounts holding it; none = everyone in the area. */
  permission?: PermissionKey;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** The sidebar of each back-office area, grouped the way the work is done (template: arhamkhnz admin dashboard). */
export const NAVIGATION: Record<Area, NavGroup[]> = {
  admin: [
    {
      label: 'Dự án & sản xuất',
      items: [
        { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
        { href: '/admin/projects', label: 'Dự án phim', icon: FolderKanban },
        { href: '/admin/requests', label: 'Duyệt yêu cầu', icon: Inbox },
        { href: '/admin/studios', label: 'Studio đối tác', icon: Building2, permission: PERMISSION.STUDIO_MANAGE },
        { href: '/admin/movies', label: 'Quản lý phim', icon: MonitorPlay },
      ],
    },
    {
      label: 'Tài chính & người dùng',
      items: [
        { href: '/admin/finance', label: 'Tài chính', icon: Wallet, permission: PERMISSION.FINANCE_REPORT_READ },
        { href: '/admin/membership-plans', label: 'Gói thành viên & Doanh thu', icon: ScrollText },
        { href: '/admin/coin-transactions', label: 'Giao dịch Coin', icon: Coins },
        { href: '/admin/rewards', label: 'Điểm danh & vòng quay', icon: Gift },
        { href: '/admin/permissions', label: 'Tài khoản & Phân quyền', icon: Users },
      ],
    },
    {
      label: 'Vận hành',
      items: [
        { href: '/admin/support', label: 'Hỗ trợ khách hàng', icon: Headset, permission: PERMISSION.SUPPORT_CASE_READ },
        { href: '/admin/support/ai', label: 'Chatbox AI', icon: Bot, permission: PERMISSION.SUPPORT_KNOWLEDGE_MANAGE },
        { href: '/admin/ads', label: 'Quảng cáo', icon: Megaphone, permission: PERMISSION.AD_MANAGE },
        { href: '/admin/policies', label: 'Chính sách', icon: ShieldCheck, permission: PERMISSION.PLATFORM_SETTINGS_MANAGE },
        { href: '/admin/notifications', label: 'Thông báo', icon: Bell },
        { href: '/admin/settings', label: 'Cài đặt nền tảng', icon: Settings },
      ],
    },
  ],
  reviewer: [
    {
      label: 'Thẩm định',
      items: [
        { href: '/reviewer', label: 'Thẩm định video Master', icon: Clapperboard },
        { href: '/reviewer/projects', label: 'Hàng đợi dự án', icon: FolderKanban },
        { href: '/reviewer/projects?filter=approved', label: 'Phim Final', icon: FileCheck2 },
        { href: '/reviewer/projects?filter=revising', label: 'Yêu cầu chỉnh sửa', icon: FilePenLine },
      ],
    },
    {
      label: 'Đối tác & quy định',
      items: [
        { href: '/reviewer/studios', label: 'Studio đối tác', icon: Building2, permission: PERMISSION.STUDIO_MANAGE },
        { href: '/reviewer/policies', label: 'Chính sách', icon: BookOpenCheck, permission: PERMISSION.CONTENT_REVIEW },
      ],
    },
    { label: 'Tài khoản', items: [{ href: '/reviewer/notifications', label: 'Thông báo', icon: Bell }, { href: '/reviewer/profile', label: 'Hồ sơ', icon: UserRound }] },
  ],
  creator: [
    { label: 'Biên kịch', items: [{ href: '/creator/projects', label: 'Dự án kịch bản', icon: FilePenLine }] },
    { label: 'Tài khoản', items: [{ href: '/creator/notifications', label: 'Thông báo', icon: Bell }, { href: '/creator/profile', label: 'Hồ sơ', icon: UserRound }] },
  ],
  staff: [
    {
      label: 'Vận hành',
      items: [
        { href: '/staff', label: 'Hỗ trợ khách hàng', icon: Headset, permission: PERMISSION.SUPPORT_CASE_READ },
        { href: '/staff/lookup', label: 'Tra cứu (chỉ đọc)', icon: Search },
      ],
    },
    { label: 'Tài khoản', items: [{ href: '/staff/notifications', label: 'Thông báo', icon: Bell }, { href: '/staff/profile', label: 'Hồ sơ', icon: UserRound }] },
  ],
};

/**
 * The menu entry a location is under: the longest href matching the path (and its query, when the href has one),
 * so /admin/support/ai lights "Chatbox AI" and /reviewer/projects?filter=approved lights "Phim Final".
 */
export function activeNavHref(groups: NavGroup[], pathname: string, search = ''): string | null {
  const here = new URLSearchParams(search);
  const hrefs = groups.flatMap((g) => g.items.map((i) => i.href));
  const matches = hrefs.filter((href) => {
    const [path, query] = href.split('?');
    if (query) return pathname === path && [...new URLSearchParams(query)].every(([k, v]) => here.get(k) === v);
    // An area root (/admin) is its own overview page, not the parent of every page under it.
    if (path.split('/').length === 2) return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  });
  return matches.sort((a, b) => b.length - a.length)[0] ?? null;
}
