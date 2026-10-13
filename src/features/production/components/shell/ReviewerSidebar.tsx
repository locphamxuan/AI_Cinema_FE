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
      className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-[#111319] md:min-h-[calc(100vh-3.5rem)] transition-colors"
    >
      <div className="hidden md:block px-5 py-4 border-b border-slate-200/60 dark:border-white/5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Kiểm duyệt</p>
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">Không gian làm việc Reviewer</p>
      </div>
      <ul className="flex md:flex-col gap-1 p-2 md:p-3 overflow-x-auto">
        {items.map(({ href, label, icon: Icon, active, ...rest }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                active
                  ? 'bg-purple-600/10 text-purple-700 dark:text-purple-300 font-semibold shadow-xs border border-purple-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${
                active
                  ? 'bg-purple-600/20 text-purple-600 dark:text-purple-300'
                  : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
              }`}>
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </div>
              <span className="flex-1">{label}</span>
              {'badge' in rest && rest.badge !== undefined && (
                <span className="rounded-full bg-purple-600 text-white font-mono px-2 py-0.5 text-[11px] font-semibold shadow-xs" title="Token còn lại">
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
