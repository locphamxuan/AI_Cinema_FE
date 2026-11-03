'use client';

import { usePathname } from 'next/navigation';
import { Bell, Clapperboard, Coins, UserRound } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';

/** Left navigation of the Content Creator area. */
export function CreatorSidebar() {
  const pathname = usePathname();
  const items = [
    {
      href: '/creator/projects',
      label: 'Dự án phim',
      icon: Clapperboard,
      active: pathname === '/creator' || pathname.startsWith('/creator/projects'),
    },
    { href: '/creator/token-requests', label: 'Xin thêm Token', icon: Coins, active: pathname.startsWith('/creator/token-requests') },
    { href: '/creator/notifications', label: 'Thông báo', icon: Bell, active: pathname.startsWith('/creator/notifications') },
    { href: '/creator/profile', label: 'Hồ sơ tài khoản', icon: UserRound, active: pathname.startsWith('/creator/profile') },
  ];

  return <DashboardSidebar label="Khu sản xuất" title="Sản xuất nội dung" subtitle="Dự án được giao cho bạn" icon={Clapperboard} items={items} />;
}
