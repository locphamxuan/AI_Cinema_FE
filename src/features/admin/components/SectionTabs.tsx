'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCan } from '@/hooks/useCan';
import type { PermissionKey } from '@/lib/permissions';
import { PageHeader } from '@/components/data/PageHeader';

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
    <main className="mx-auto w-full max-w-7xl space-y-5 px-6 py-6 lg:px-8">
      <PageHeader title={title} description={description} />
      {open.length > 1 && (
        <nav aria-label={title} className="inline-flex max-w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1">
          {open.map((t) => (
            <Link
              key={t.key}
              href={`${pathname}?tab=${t.key}`}
              aria-current={t === current ? 'page' : undefined}
              className={`rounded-md px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
                t === current
                  ? 'bg-background font-medium text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
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
