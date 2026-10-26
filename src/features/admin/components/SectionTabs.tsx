'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCan } from '@/hooks/useCan';
import type { PermissionKey } from '@/lib/permissions';

export interface SectionTab {
  key: string;
  label: string;
  /** The tab shows only to accounts holding it. */
  permission: PermissionKey;
  content: React.ReactNode;
}

/** One Admin section made of several pages: the tabs the account may open, the current one kept in `?tab=`. */
export function SectionTabs({ title, description, tabs }: { title: string; description: string; tabs: SectionTab[] }) {
  return (
    <Suspense>
      <Tabs title={title} description={description} tabs={tabs} />
    </Suspense>
  );
}

function Tabs({ title, description, tabs }: { title: string; description: string; tabs: SectionTab[] }) {
  const pathname = usePathname();
  const requested = useSearchParams().get('tab');
  const can = useCan();
  const open = tabs.filter((t) => can(t.permission));
  const current = open.find((t) => t.key === requested) ?? open[0];

  return (
    <main className="w-full px-6 lg:px-8 py-6 space-y-5">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </header>
      {open.length > 1 && (
        <nav aria-label={title} className="flex gap-1 border-b border-sky-100 dark:border-white/10 overflow-x-auto">
          {open.map((t) => (
            <Link
              key={t.key}
              href={`${pathname}?tab=${t.key}`}
              aria-current={t === current ? 'page' : undefined}
              className={`-mb-px px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                t === current
                  ? 'border-sky-500 text-sky-800 dark:text-sky-200 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      )}
      {current?.content}
    </main>
  );
}
