'use client';

import { useEffect, useMemo, useState } from 'react';
import { Lock, Check, X } from 'lucide-react';
import { adminService, type PermissionRow, type RolePermissions } from '@/services/adminService';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { UserRole } from '@/types/production';
import { BACKEND_ROLE_LABEL, BACKEND_ROLES, PERMISSION_AREA_LABEL } from '../roles';

type Matrix = Record<UserRole, Set<string>>;

const toMatrix = (roles: RolePermissions[]) =>
  Object.fromEntries(roles.map((r) => [r.role, new Set(r.permissions)])) as Matrix;

const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((x) => b.has(x));

/**
 * Modern Permissions Matrix:
 * Redesigned into interactive status badges (Pills) without raw checkboxes.
 * Vietnamese UI with distinct states: Được cấp quyền / Chưa cấp / Quyền hệ thống cố định.
 */
export function RolePermissionsPanel() {
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [roles, setRoles] = useState<RolePermissions[]>([]);
  const [draft, setDraft] = useState<Matrix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void Promise.all([adminService.listPermissions(), adminService.listRoles()]).then(([p, r]) => {
      if (!p.success || !r.success) {
        setError(p.message ?? r.message ?? 'Không tải được bảng phân quyền.');
        return;
      }
      setPermissions(p.data);
      setRoles(r.data);
      setDraft(toMatrix(r.data));
    });
  }, []);

  const saved = useMemo(() => toMatrix(roles), [roles]);
  const locked = useMemo(() => new Map(roles.map((r) => [r.role, new Set(r.lockedPermissions)])), [roles]);
  const changedRoles = draft ? BACKEND_ROLES.filter((role) => !sameSet(draft[role], saved[role] ?? new Set())) : [];
  const areas = [...new Set(permissions.map((p) => p.area))];

  const toggle = (role: UserRole, key: string) =>
    setDraft((prev) => {
      if (!prev) return prev;
      const next = new Set(prev[role]);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, [role]: next };
    });

  const save = async () => {
    if (!draft) return;
    setIsSaving(true);
    const results = await Promise.all(changedRoles.map((role) => adminService.setRolePermissions(role, [...draft[role]])));
    setIsSaving(false);
    const failed = results.find((r) => !r.success);
    setRoles(
      roles.map((r) => {
        const res = results.find((x) => x.success && x.data.role === r.role);
        return res ? { ...r, permissions: res.data.permissions } : r;
      })
    );
    if (failed) {
      toast.error('Chưa lưu được hết', failed.message ?? 'Thử lại sau ít phút.');
      return;
    }
    toast.success('Đã lưu phân quyền', `Cập nhật ${changedRoles.map((r) => BACKEND_ROLE_LABEL[r]).join(', ')}. Tài khoản đang đăng nhập nhận quyền mới trong vòng 30 giây.`);
  };

  if (error) return <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>;
  if (!draft) return <p className="text-xs text-slate-500 dark:text-slate-400">Đang tải ma trận phân quyền…</p>;

  return (
    <section className="bg-white dark:bg-[#0F1C27] rounded-3xl border border-sky-100 dark:border-white/10 overflow-hidden shadow-sm">
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Ma trận phân quyền hệ thống
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Nhấp trực tiếp vào ô trạng thái để bật / tắt quyền hạn cho vai trò tương ứng. Biểu tượng ổ khóa màu cam là quyền bắt buộc của hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {changedRoles.length > 0 && (
            <Button type="button" variant="secondary" onClick={() => setDraft(toMatrix(roles))} className="px-4 py-2 rounded-xl text-xs font-semibold">
              Hoàn tác
            </Button>
          )}
          <Button
            type="button"
            disabled={changedRoles.length === 0 || isSaving}
            onClick={save}
            className="px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-sky-500/10 cursor-pointer"
          >
            {isSaving ? 'Đang lưu…' : changedRoles.length > 0 ? `Lưu ${changedRoles.length} vai trò thay đổi` : 'Chưa có thay đổi'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
            <tr>
              <th scope="col" className="py-3 px-6 text-left font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 w-1/3">
                Chức năng & Mã quyền
              </th>
              {BACKEND_ROLES.map((role) => (
                <th key={role} scope="col" className="py-3 px-3 font-bold text-center whitespace-nowrap">
                  <span className="block text-slate-900 dark:text-white font-semibold">{BACKEND_ROLE_LABEL[role]}</span>
                  {changedRoles.includes(role) && (
                    <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Chưa lưu
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          {areas.map((area) => (
            <tbody key={area} className="divide-y divide-slate-100 dark:divide-white/5">
              <tr className="bg-sky-50/40 dark:bg-sky-500/[0.04]">
                <th
                  colSpan={BACKEND_ROLES.length + 1}
                  scope="colgroup"
                  className="px-6 py-2.5 text-left text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wide"
                >
                  {PERMISSION_AREA_LABEL[area] ?? area}
                </th>
              </tr>
              {permissions
                .filter((p) => p.area === area)
                .map((permission) => (
                  <tr key={permission.key} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <th scope="row" className="py-3 px-6 text-left font-normal align-middle">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{permission.description}</p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{permission.key}</p>
                    </th>
                    {BACKEND_ROLES.map((role) => {
                      const isLocked = locked.get(role)?.has(permission.key) ?? false;
                      const isGranted = draft[role].has(permission.key);

                      if (isLocked) {
                        return (
                          <td key={role} className="py-2.5 px-3 text-center align-middle">
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                              title={`${BACKEND_ROLE_LABEL[role]} luôn giữ quyền này`}
                            >
                              <Lock className="w-3 h-3 text-amber-500" aria-hidden="true" />
                              <span>Cố định</span>
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td key={role} className="py-2.5 px-3 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => toggle(role, permission.key)}
                            aria-label={`${BACKEND_ROLE_LABEL[role]}: ${permission.description} - ${isGranted ? 'Được phép' : 'Chưa cấp'}`}
                            className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 border ${
                              isGranted
                                ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-100 hover:border-emerald-500/40 shadow-xs'
                                : 'bg-slate-100/60 dark:bg-white/[0.04] text-slate-400 dark:text-slate-500 border-transparent hover:bg-slate-200/50 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                          >
                            {isGranted ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Được phép</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                                <span>Chưa cấp</span>
                              </>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}
