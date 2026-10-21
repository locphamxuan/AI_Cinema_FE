'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clapperboard } from 'lucide-react';

/**
 * Left navigation of the Content Creator area: keeps visual consistency with Admin & Reviewer consoles.
 */
export function CreatorSidebar() {
  const pathname = usePathname();

  const items = [
    {
      href: '/creator/projects',
      label: 'Dự án phim',
      icon: Clapperboard,
      active: pathname === '/creator' || pathname.startsWith('/creator/projects'),
    },
  ];

  return (
    <nav
      aria-label="Khu sản xuất nội dung"
      className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#111319] md:min-h-[calc(100vh-3.5rem)] transition-colors"
    >
      {/* Brand strip */}
      <div className="hidden md:flex items-center gap-3 px-5 py-4 border-b border-slate-200/60 dark:border-white/5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
          <Clapperboard className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">Không gian Creator</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Sản xuất nội dung</p>
        </div>
      </div>
      <ul className="flex md:flex-col gap-1 p-2 md:p-3 overflow-x-auto">
        {items.map(({ href, label, icon: Icon, active }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                active
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-700 dark:text-blue-300 font-semibold shadow-xs border border-blue-400/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  active
                    ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 text-blue-600 dark:text-blue-300'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </div>
              <span className="flex-1">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
