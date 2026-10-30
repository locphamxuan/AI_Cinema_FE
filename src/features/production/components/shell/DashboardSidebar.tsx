'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  /** A short figure next to the label, such as the Token left. */
  badge?: { value: string; title: string };
}

/**
 * The left navigation every back-office area shares (Admin, Reviewer, Creator): one look for all roles,
 * which differ only in their items. On phones it becomes a scrolling row under the header.
 */
export function DashboardSidebar({
  label,
  title,
  subtitle,
  icon: TitleIcon,
  items,
}: {
  /** Accessible name of the navigation. */
  label: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  items: SidebarItem[];
}) {
  return (
    <nav
      aria-label={label}
      className="shrink-0 border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:w-64 md:border-r md:border-b-0"
    >
      <div className="hidden items-center gap-3 px-5 pt-5 pb-3 md:flex">
        <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
          <TitleIcon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <ul className="flex gap-1 overflow-x-auto p-2 md:flex-col md:px-3">
        {items.map(({ href, label: text, icon: Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm whitespace-nowrap outline-none transition-colors focus-visible:ring-3 focus-visible:ring-sidebar-ring/50',
                active
                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground md:before:absolute md:before:inset-y-2 md:before:-left-3 md:before:w-[3px] md:before:rounded-r-full md:before:bg-sidebar-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )}
            >
              <Icon className={cn('size-4 shrink-0', active && 'text-sidebar-primary')} aria-hidden="true" />
              <span className="flex-1">{text}</span>
              {badge && (
                <span
                  title={badge.title}
                  className="rounded-md bg-sidebar-primary/10 px-1.5 py-0.5 text-xs font-medium text-sidebar-primary tabular-nums"
                >
                  {badge.value}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
