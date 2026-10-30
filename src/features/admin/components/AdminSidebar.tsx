'use client';

import { usePathname } from 'next/navigation';
import { useCan } from '@/hooks/useCan';
import { DashboardSidebar } from '@/features/production/components/shell/DashboardSidebar';
import { ADMIN_SECTIONS, opensSection } from '../sections';

/** Left navigation of the Admin console: the sections the account's permissions open. */
export function AdminSidebar() {
  const pathname = usePathname();
  const can = useCan();
  const items = ADMIN_SECTIONS.filter((s) => opensSection(s, can)).map(({ href, label }) => ({
    href,
    label,
    active: href === '/admin' ? pathname === '/admin' : pathname.startsWith(href),
  }));
  return <DashboardSidebar label="Khu quản trị" title="Quản trị" subtitle="Toàn bộ nền tảng" items={items} />;
}
