'use client';

import { usePathname } from 'next/navigation';
import { DashboardSidebar } from './DashboardSidebar';

/** Left navigation of the Content Creator area. */
export function CreatorSidebar() {
  const pathname = usePathname();
  const items = [
    {
      href: '/creator/projects',
      label: 'Dự án phim',
      active: pathname === '/creator' || pathname.startsWith('/creator/projects'),
    },
    {
      href: '/creator/token-requests',
      label: 'Xin thêm Token',
      active: pathname.startsWith('/creator/token-requests'),
    },
    { href: '/creator/notifications', label: 'Thông báo', active: pathname.startsWith('/creator/notifications') },
    { href: '/creator/profile', label: 'Hồ sơ tài khoản', active: pathname.startsWith('/creator/profile') },
  ];

  return (
    <DashboardSidebar label="Khu sản xuất" title="Sản xuất nội dung" subtitle="Dự án được giao cho bạn" items={items} />
  );
}
