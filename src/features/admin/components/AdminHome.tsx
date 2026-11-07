'use client';

import { useCan } from '@/hooks/useCan';
import { ADMIN_SECTIONS, opensSection } from '../sections';
import { AdminExecutivePortal } from './AdminExecutivePortal';

/** /admin renders the executive B2B project & release management portal in Obsidian Dark Mode. */
export function AdminHome() {
  const can = useCan();
  const hasAccess = ADMIN_SECTIONS.some((s) => opensSection(s, can));

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#090B10] p-6 text-sm text-slate-400">
        Tài khoản của bạn chưa được cấp quyền quản trị nào. Hãy nhờ Admin cấp quyền ở mục Phân quyền.
      </div>
    );
  }

  return <AdminExecutivePortal />;
}
