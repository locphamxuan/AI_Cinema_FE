'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Building2, Clapperboard, Coins, ShieldCheck, UserRound } from 'lucide-react';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { reviewerTokenService, TOKENS_CHANGED_EVENT } from '@/services/reviewerTokenService';
import { useResource } from '../../hooks/useResource';
import { formatNumber } from '../../lib/format';
import { DashboardSidebar, type SidebarItem } from './DashboardSidebar';

/**
 * Left navigation of the Reviewer area: movie projects and the Reviewer's Token, with the balance always in
 * sight. The Admin, overseeing projects here, only gets the projects.
 */
export function ReviewerSidebar() {
  const pathname = usePathname();
  const can = useCan();
  const hasBudget = can(PERMISSION.PROJECT_FEE_ALLOCATE);
  const wallet = useResource(hasBudget ? 'reviewer-tokens:me' : null, reviewerTokenService.mine);
  const { reload } = wallet;

  useEffect(() => {
    if (!hasBudget) return;
    const refresh = () => void reload();
    window.addEventListener(TOKENS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(TOKENS_CHANGED_EVENT, refresh);
  }, [hasBudget, reload]);

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
    ...(hasBudget
      ? [
          {
            href: '/reviewer/tokens',
            label: 'Token',
            icon: Coins,
            active: pathname.startsWith('/reviewer/tokens'),
            badge: wallet.data ? { value: formatNumber(wallet.data.balanceTokens), title: 'Token còn lại' } : undefined,
          },
        ]
      : []),
    { href: '/reviewer/notifications', label: 'Thông báo', icon: Bell, active: pathname.startsWith('/reviewer/notifications') },
    { href: '/reviewer/profile', label: 'Hồ sơ tài khoản', icon: UserRound, active: pathname.startsWith('/reviewer/profile') },
  ];

  return <DashboardSidebar label="Khu kiểm duyệt" title="Kiểm duyệt nội dung" subtitle="Dự án, Studio và Token" icon={ShieldCheck} items={items} />;
}
