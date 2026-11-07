'use client';

import { usePathname } from 'next/navigation';
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
      active: pathname === '/reviewer' || pathname.startsWith('/reviewer/projects'),
    },
    ...(can(PERMISSION.STUDIO_MANAGE)
      ? [{ href: '/reviewer/studios', label: 'Studio', active: pathname.startsWith('/reviewer/studios') }]
      : []),
    { href: '/reviewer/notifications', label: 'Thông báo', active: pathname.startsWith('/reviewer/notifications') },
    { href: '/reviewer/profile', label: 'Hồ sơ tài khoản', active: pathname.startsWith('/reviewer/profile') },
  ];

  return (
    <DashboardSidebar
      label="Khu kiểm duyệt"
      title="Kiểm duyệt nội dung"
      subtitle="Dự án và Studio"
      items={items}
    />
  );
}
