'use client';

import { usePathname } from 'next/navigation';
import { Bell, Building2, Clapperboard, ShieldCheck, UserRound } from 'lucide-react';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { DashboardSidebar, type SidebarItem } from './DashboardSidebar';

/** Left navigation of the Reviewer area: movie projects and studios. The Admin, overseeing projects here, only gets the projects. */
export function ReviewerSidebar() {
  const pathname = usePathname();
  const can = useCan();

  const items: SidebarItem[] = [
    {
      href: '/reviewer/projects',
      label: 'Dự án phim',
      icon: Clapperboard,
      active: pathname === '/reviewer' || pathname.startsWith('/reviewer/projects'),
    },
    ...(can(PERMISSION.STUDIO_MANAGE)
      ? [{ href: '/reviewer/studios', label: 'Studio', icon: Building2, active: pathname.startsWith('/reviewer/studios') }]
      : []),
    { href: '/reviewer/notifications', label: 'Thông báo', icon: Bell, active: pathname.startsWith('/reviewer/notifications') },
    { href: '/reviewer/profile', label: 'Hồ sơ tài khoản', icon: UserRound, active: pathname.startsWith('/reviewer/profile') },
  ];

  return (
    <DashboardSidebar
      label="CONTENT REVIEW"
      title="CONTENT REVIEW"
      subtitle="Thẩm Định & Phát Hành"
      icon={ShieldCheck}
      items={items}
    />
  );
}
