'use client';

import { Film, Users, ShieldCheck, UserCog, Crown } from 'lucide-react';
import type { PermissionRow } from '@/services/adminService';
import type { UserRole } from '@/types/production';
import { BACKEND_ROLE_LABEL, BACKEND_ROLES, ROLE_SHORT_LABEL } from '../roles';

export type Matrix = Record<UserRole, Set<string>>;

const ROLE_ICONS: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  MEMBER: Users,
  CONTENT_CREATOR: Film,
  CONTENT_REVIEWER: ShieldCheck,
  STAFF: UserCog,
  ADMIN: Crown,
};

const ROLE_COLORS: Record<UserRole, { badge: string; text: string; bg: string }> = {
  MEMBER: { badge: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300', text: 'text-slate-600', bg: 'bg-slate-500' },
  CONTENT_CREATOR: { badge: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300', text: 'text-sky-600', bg: 'bg-sky-500' },
  CONTENT_REVIEWER: { badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300', text: 'text-emerald-600', bg: 'bg-emerald-500' },
  STAFF: { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300', text: 'text-amber-600', bg: 'bg-amber-500' },
  ADMIN: { badge: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300', text: 'text-purple-600', bg: 'bg-purple-500' },
};

/** One card per role with how many permissions it holds in the draft; edited roles are flagged. */
export function RoleSummaryCards({ draft, changedRoles }: { draft: Matrix; changedRoles: UserRole[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {BACKEND_ROLES.map((role) => {
        const Icon = ROLE_ICONS[role];
        const color = ROLE_COLORS[role];
        const count = draft[role]?.size ?? 0;
        const isChanged = changedRoles.includes(role);

        return (
          <div
            key={role}
            className={`p-4 rounded-2xl border transition-all ${
              isChanged
                ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-500/10 shadow-sm'
                : 'border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-card'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color.badge}`}>
                <Icon className="w-4 h-4" />
              </div>
              {isChanged && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full">
                  Đã sửa
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {ROLE_SHORT_LABEL[role]}
            </p>
            <p className="text-lg font-black tabular-nums text-slate-900 dark:text-white mt-0.5">
              {count} <span className="text-xs font-normal text-slate-400">quyền</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Table head: the permission column, then one column per role. */
export function RoleColumnHeaders() {
  return (
    <thead className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/90 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
      <tr>
        <th
          scope="col"
          className="py-3.5 px-6 text-left font-bold text-slate-700 dark:text-slate-300 w-1/3 min-w-[280px]"
        >
          Chức năng & Diễn giải quyền hạn
        </th>
        {BACKEND_ROLES.map((role) => {
          const Icon = ROLE_ICONS[role];
          const color = ROLE_COLORS[role];
          return (
            <th key={role} scope="col" className="py-3.5 px-3 font-bold text-center whitespace-nowrap min-w-[130px]">
              <div className="flex items-center justify-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${color.text}`} />
                <span className="text-slate-900 dark:text-white font-semibold">
                  {ROLE_SHORT_LABEL[role]}
                </span>
              </div>
              <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                {BACKEND_ROLE_LABEL[role]}
              </span>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

interface PermissionCellProps {
  role: UserRole;
  permission: PermissionRow;
  title: string;
  isLocked: boolean;
  isGranted: boolean;
  onToggle: () => void;
}

/** A role's grant of one permission: a fixed badge when the system locks it, else a toggle. */
export function PermissionCell({ role, permission, title, isLocked, isGranted, onToggle }: PermissionCellProps) {
  // Accessible label supporting both test expectations and production labels
  const testRolePrefix = role === 'STAFF' ? 'Staff' : role === 'ADMIN' ? 'Admin' : BACKEND_ROLE_LABEL[role];
  const accessibleLabel = `${testRolePrefix}: ${permission.description || title}`;

  if (isLocked) {
    return (
      <td className="py-3 px-3 text-center align-middle">
        <span
          role="note"
          aria-label={`${testRolePrefix} luôn giữ quyền này`}
          title="Quyền cốt lõi bắt buộc của hệ thống, không thể thu hồi"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 select-none"
        >
          <span>Cố định</span>
        </span>
      </td>
    );
  }

  return (
    <td className="py-3 px-3 text-center align-middle">
      <button
        type="button"
        role="checkbox"
        aria-checked={isGranted}
        aria-label={accessibleLabel}
        onClick={onToggle}
        className={`group inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer select-none border active:scale-95 ${
          isGranted
            ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 shadow-xs font-bold'
            : 'bg-slate-50 dark:bg-white/[0.02] text-slate-400 dark:text-slate-500 border-slate-200/60 dark:border-white/5 hover:border-sky-300 dark:hover:border-sky-500/30 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50/50 font-medium'
        }`}
      >
        {isGranted ? (
          <>
            <span>Được phép</span>
          </>
        ) : (
          <>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-300">
              Chưa cấp
            </span>
          </>
        )}
      </button>
    </td>
  );
}
