'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCan } from '@/hooks/useCan';
import { ADMIN_SECTIONS } from '../sections';

/** /admin opens the first section the account may use. */
export function AdminHome() {
  const router = useRouter();
  const can = useCan();
  const first = ADMIN_SECTIONS.find((s) => can(s.permission));

  useEffect(() => {
    if (first) router.replace(first.href);
  }, [first, router]);

  return first ? null : (
    <p className="p-6 text-xs text-slate-500 dark:text-slate-400">Vai trò của bạn chưa được cấp quyền quản trị nào.</p>
  );
}
