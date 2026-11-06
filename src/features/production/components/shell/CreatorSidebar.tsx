'use client';

import { usePathname } from 'next/navigation';
import { Bell, Clapperboard, UserRound } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';

/** Left navigation of the Content Creator area in Cinema Dark theme. */
export function CreatorSidebar() {
  const pathname = usePathname();
  const items = [
    {
      href: '/creator/projects',
      label: 'Dự án phim',
      icon: Clapperboard,
      active: pathname === '/creator' || pathname.startsWith('/creator/projects'),
    },
    {
      href: '/creator/notifications',
      label: 'Thông báo',
      icon: Bell,
      active: pathname.startsWith('/creator/notifications'),
    },
    {
      href: '/creator/profile',
      label: 'Hồ sơ tài khoản',
      icon: UserRound,
      active: pathname.startsWith('/creator/profile'),
    },
  ];

  return (
    <DashboardSidebar
      label="STUDIO PARTNER"
      title="STUDIO PARTNER"
      subtitle="Cổng Phân Phối Phim"
      icon={Clapperboard}
      items={items}
    />
  );
}
