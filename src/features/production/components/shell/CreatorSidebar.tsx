'use client';

import { usePathname } from 'next/navigation';
import { Bell, Clapperboard, BookOpen, Handshake, UserRound } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';

/**
 * Left navigation of the In-house Screenwriter area in Cinematic Obsidian theme.
 * Aligned strictly with the Screenwriter workflow:
 * - Dự Án Kịch Bản
 * - Thư Viện Kịch Bản Phân Cảnh
 * - Tiến Độ Chuyển Giao Studio
 * - Thông Báo Thẩm Định
 * - Hồ sơ tài khoản
 */
export function CreatorSidebar() {
  const pathname = usePathname();
  const items = [
    {
      href: '/creator/projects',
      label: 'Dự Án Kịch Bản',
      icon: Clapperboard,
      active: pathname === '/creator' || pathname.startsWith('/creator/projects'),
    },
    {
      href: '/creator/scripts',
      label: 'Thư Viện Kịch Bản Phân Cảnh',
      icon: BookOpen,
      active: pathname.startsWith('/creator/scripts'),
    },
    {
      href: '/creator/studio-handoff',
      label: 'Tiến Độ Chuyển Giao Studio',
      icon: Handshake,
      active: pathname.startsWith('/creator/studio-handoff'),
    },
    {
      href: '/creator/notifications',
      label: 'Thông Báo Thẩm Định',
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
      label="BIÊN KỊCH NỘI BỘ"
      title="BIÊN KỊCH NỘI BỘ"
      subtitle="Cổng Biên Kịch Nội Bộ"
      icon={Clapperboard}
      items={items}
    />
  );
}
