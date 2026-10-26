'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCan } from '@/hooks/useCan';
import { ADMIN_SECTIONS, opensSection } from '../sections';

/** /admin opens the first section the account may use. */
export function AdminHome() {
  const router = useRouter();
  const can = useCan();
  const first = ADMIN_SECTIONS.find((s) => opensSection(s, can));

  useEffect(() => {
    if (first) router.replace(first.href);
  }, [first, router]);

  return first ? null : (
    <p className="p-6 text-sm text-slate-500 dark:text-slate-400">Tài khoản của bạn chưa được cấp quyền quản trị nào. Hãy nhờ Admin cấp quyền ở mục Phân quyền.</p>
  );
}
