'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

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
 * which differ only in their items. The current page carries a bar on its edge.
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
      className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-sky-100 dark:border-white/5 bg-white dark:bg-[#0F1C27] md:min-h-[calc(100vh-3.5rem)] transition-colors"
    >
      <div className="hidden md:flex items-center gap-3 px-5 py-4 border-b border-sky-100 dark:border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
          <TitleIcon className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      <ul className="flex md:flex-col gap-0.5 p-2 md:p-3 overflow-x-auto">
        {items.map(({ href, label: text, icon: Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 ${
                active
                  ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-800 dark:text-sky-200 font-semibold md:before:absolute md:before:left-0 md:before:top-2 md:before:bottom-2 md:before:w-[3px] md:before:rounded-full md:before:bg-sky-500'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-sky-600 dark:text-sky-300' : 'text-slate-400'}`} aria-hidden="true" />
              <span className="flex-1">{text}</span>
              {badge && (
                <span title={badge.title} className="rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-200 px-2 py-0.5 text-xs font-semibold tabular-nums">
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
