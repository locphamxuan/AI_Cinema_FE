'use client';

import { useCan } from '@/hooks/useCan';
import { ADMIN_SECTIONS, opensSection } from '../sections';
import { AdminOverviewDashboard } from './AdminOverviewDashboard';

/** /admin renders the executive overview dashboard with metrics and charts. */
export function AdminHome() {
  const can = useCan();
  const hasAccess = ADMIN_SECTIONS.some((s) => opensSection(s, can));

  if (!hasAccess) {
    return (
      <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
        Tài khoản của bạn chưa được cấp quyền quản trị nào. Hãy nhờ Admin cấp quyền ở mục Phân quyền.
      </p>
    );
  }

  return <AdminOverviewDashboard />;
}
