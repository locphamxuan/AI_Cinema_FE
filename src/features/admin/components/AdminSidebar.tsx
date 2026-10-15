'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCan } from '@/hooks/useCan';
import { ADMIN_SECTIONS } from '../sections';

/** Left navigation of the Admin console: the sections the account's permissions open. */
export function AdminSidebar() {
  const pathname = usePathname();
  const can = useCan();
  const sections = ADMIN_SECTIONS.filter((s) => can(s.permission));

  return (
    <nav
      aria-label="Khu quản trị"
      className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-[#111319] md:min-h-[calc(100vh-3.5rem)] transition-colors"
    >
      <div className="hidden md:block px-5 py-4 border-b border-slate-200/60 dark:border-white/5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bảng điều khiển</p>
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">Quản trị toàn hệ thống</p>
      </div>
      <ul className="flex md:flex-col gap-1 p-2 md:p-3 overflow-x-auto">
        {sections.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
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
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** One Admin page; most panels carry their own heading, so the title is optional. */
export function AdminPageFrame({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <main className="w-full px-6 lg:px-8 py-6 space-y-6">
      {title && (
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
        </div>
      )}
      {children}
    </main>
  );
}
