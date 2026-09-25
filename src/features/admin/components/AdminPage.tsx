'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, KeyRound, Settings, Users } from 'lucide-react';
import { useCan } from '@/hooks/useCan';
import { PERMISSION, type PermissionKey } from '@/lib/permissions';
import { AccountsPanel } from './AccountsPanel';
import { RolePermissionsPanel } from './RolePermissionsPanel';
import { PlatformSettingsPanel } from './PlatformSettingsPanel';

type Tab = 'accounts' | 'permissions' | 'settings';

const TABS: { key: Tab; label: string; icon: typeof Users; permission: PermissionKey }[] = [
  { key: 'accounts', label: 'Tài khoản', icon: Users, permission: PERMISSION.USER_READ },
  { key: 'permissions', label: 'Phân quyền', icon: KeyRound, permission: PERMISSION.ROLE_MANAGE },
  { key: 'settings', label: 'Cài đặt sản xuất', icon: Settings, permission: PERMISSION.PLATFORM_SETTINGS_MANAGE },
];

/** Admin console: accounts, role permissions and platform settings, each shown only with its permission. */
export function AdminPage() {
  const can = useCan();
  const tabs = TABS.filter((t) => can(t.permission));
  const [active, setActive] = useState<Tab>('accounts');
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Quản trị</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tài khoản, phân quyền và cài đặt của nền tảng.</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          {can(PERMISSION.PRODUCTION_READ) && (
            <Link href="/reviewer" className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline">
              Xem dự án sản xuất <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          )}
          <Link href="/staff" className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline">
            Trang vận hành <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div role="tablist" aria-label="Mục quản trị" className="flex gap-1 border-b border-slate-200 dark:border-white/10">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={current?.key === key}
            onClick={() => setActive(key)}
            className={`flex items-center gap-1.5 px-3 py-2 -mb-px border-b-2 text-xs font-semibold transition cursor-pointer ${
              current?.key === key
                ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {!current && <p className="text-xs text-slate-500 dark:text-slate-400">Vai trò của bạn chưa được cấp quyền quản trị nào.</p>}
      {current?.key === 'accounts' && <AccountsPanel />}
      {current?.key === 'permissions' && <RolePermissionsPanel />}
      {current?.key === 'settings' && <PlatformSettingsPanel />}
    </main>
  );
}
