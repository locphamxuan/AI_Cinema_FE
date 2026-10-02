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
      className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#12141A] md:min-h-[calc(100vh-3.5rem)]"
    >
      <ul className="flex md:flex-col gap-1 p-2 md:p-3 overflow-x-auto">
        {sections.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
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
                {label}
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
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
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
