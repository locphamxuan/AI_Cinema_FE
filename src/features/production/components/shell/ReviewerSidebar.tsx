'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clapperboard, Coins } from 'lucide-react';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { reviewerTokenService, TOKENS_CHANGED_EVENT } from '@/services/reviewerTokenService';
import { useResource } from '../../hooks/useResource';
import { formatNumber } from '../../lib/format';

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

  const items = [
    {
      href: '/reviewer/projects',
      label: 'Dự án phim',
      icon: Clapperboard,
      active: pathname === '/reviewer' || pathname.startsWith('/reviewer/projects'),
    },
    ...(hasBudget
      ? [
          {
            href: '/reviewer/tokens',
            label: 'Token',
            icon: Coins,
            active: pathname.startsWith('/reviewer/tokens'),
            badge: wallet.data ? formatNumber(wallet.data.balanceTokens) : undefined,
          },
        ]
      : []),
  ];

  return (
    <nav
      aria-label="Khu kiểm duyệt"
      className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#12141A] md:min-h-[calc(100vh-3.5rem)]"
    >
      <ul className="flex md:flex-col gap-1 p-2 md:p-3 overflow-x-auto">
        {items.map(({ href, label, icon: Icon, active, ...rest }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition ${
                active
                  ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {'badge' in rest && rest.badge !== undefined && (
                <span className="rounded-full bg-purple-600 text-white px-2 py-0.5 text-[10px]" title="Token còn lại">
                  {rest.badge}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
