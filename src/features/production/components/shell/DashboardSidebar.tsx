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
 * Sidebar supporting both Clean Modern Light Mode (Linear/Apple/Vercel) and Cinema Dark Mode.
 */
export function DashboardSidebar({
  label,
  title,
  subtitle,
  items,
}: {
  /** Accessible name of the navigation. */
  label: string;
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  items: SidebarItem[];
}) {
  return (
    <nav
      aria-label={label}
      className="md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] text-slate-900 dark:text-slate-100 md:min-h-[calc(100vh-3.5rem)] transition-colors duration-200"
    >
      {/* Studio Partner Portal section header */}
      <div className="hidden md:block px-5 py-4 border-b border-slate-200 dark:border-white/[0.08]">
        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-[#E50914]">
          {label || title}
        </p>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5">
          {subtitle}
        </p>
      </div>

      <ul className="flex md:flex-col gap-1.5 p-3 overflow-x-auto md:overflow-x-visible">
        {items.map(({ href, label: text, icon: Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:focus-visible:ring-[#E50914]/50 ${
                active
                  ? 'bg-indigo-50/80 dark:bg-red-500/10 text-indigo-600 dark:text-[#E50914] font-semibold dark:font-bold border border-indigo-200/50 dark:border-red-500/20 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              {/* Refined active indicator inside the card */}
              {active && (
                <span
                  className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-indigo-600 dark:bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.5)]"
                  aria-hidden="true"
                />
              )}
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  active ? 'text-indigo-600 dark:text-[#E50914] ml-1' : 'text-slate-400 dark:text-slate-400'
                }`}
                aria-hidden="true"
              />
              <span className="flex-1 min-w-0 truncate">{text}</span>
              {badge && (
                <span
                  title={badge.title}
                  className="shrink-0 ml-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[11px] font-mono font-medium tabular-nums border border-slate-200/70 dark:border-white/10"
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
