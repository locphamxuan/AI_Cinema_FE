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
 * Cinema Dark Left Navigation: #0F121C background, border-white/10, sleek silver text, and cinema red active accents.
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
      className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-[#0F121C] text-slate-100 md:min-h-[calc(100vh-3.5rem)] transition-colors"
    >
      {/* Studio Partner Portal section header */}
      <div className="hidden md:block px-5 py-3.5 border-b border-white/10">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#E50914]">{label || title}</p>
        <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">{subtitle}</p>
      </div>

      <ul className="flex md:flex-col gap-1 p-2 md:p-3 overflow-x-auto">
        {items.map(({ href, label: text, icon: Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/50 ${
                active
                  ? 'bg-white/10 text-white font-bold md:before:absolute md:before:left-0 md:before:top-2 md:before:bottom-2 md:before:w-[3px] md:before:rounded-full md:before:bg-[#E50914]'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#E50914]' : 'text-slate-400'}`} aria-hidden="true" />
              <span className="flex-1">{text}</span>
              {badge && (
                <span title={badge.title} className="rounded-full bg-white/10 text-slate-300 px-2 py-0.5 text-xs font-semibold tabular-nums border border-white/10">
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
