'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, RotateCcw, Shield, Layers } from 'lucide-react';
import { adminService, type PermissionRow, type RolePermissions } from '@/services/adminService';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { UserRole } from '@/types/production';
import {
  BACKEND_ROLE_LABEL,
  BACKEND_ROLES,
  PERMISSION_AREA_LABEL,
  getPermissionMeta,
} from '../roles';
import { PermissionCell, RoleColumnHeaders, RoleSummaryCards, type Matrix } from './RolePermissionParts';

const toMatrix = (roles: RolePermissions[]) =>
  Object.fromEntries(roles.map((r) => [r.role, new Set(r.permissions)])) as Matrix;

const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((x) => b.has(x));

/**
 * Modern High-Fidelity Role Permissions Matrix:
 * - 100% Vietnamese labels and descriptions with detailed contextual explanations.
 * - Non-tick pill badges with distinct status: "Được phép" (Active Emerald), "Chưa cấp" (Subtle hoverable), "Cố định" (System Locked Amber).
 * - Instant search and category filter for convenient navigation.
 * - Role overview cards showing allocated permission totals.
 */
export function RolePermissionsPanel() {
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [roles, setRoles] = useState<RolePermissions[]>([]);
  const [draft, setDraft] = useState<Matrix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Search and Area filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');

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
  const allAreas = useMemo(() => [...new Set(permissions.map((p) => p.area))], [permissions]);

  // Filtered permissions based on search query and selected area
  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      if (selectedArea !== 'all' && p.area !== selectedArea) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const meta = getPermissionMeta(p.key, p.description);
      return (
        p.key.toLowerCase().includes(q) ||
        meta.title.toLowerCase().includes(q) ||
        meta.desc.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [permissions, selectedArea, searchQuery]);

  const activeAreas = useMemo(
    () => [...new Set(filteredPermissions.map((p) => p.area))],
    [filteredPermissions]
  );

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
    const results = await Promise.all(
      changedRoles.map((role) => adminService.setRolePermissions(role, [...draft[role]]))
    );
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
    toast.success(
      'Đã lưu phân quyền',
      `Cập nhật thành công ${changedRoles.map((r) => BACKEND_ROLE_LABEL[r]).join(', ')}. Quyền mới có hiệu lực trong vòng 30 giây.`
    );
  };

  if (error) return <p className="text-xs text-rose-600 dark:text-rose-400 p-4">{error}</p>;
  if (!draft) return <p className="text-xs text-slate-500 dark:text-slate-400 p-6">Đang tải bảng phân quyền vai trò…</p>;

  return (
    <div className="space-y-6">
      {/* ── Role Permission Summary Cards ── */}
      <RoleSummaryCards draft={draft} changedRoles={changedRoles} />

      {/* ── Main Panel Card ── */}
      <section className="bg-white dark:bg-[#0F1C27] rounded-3xl border border-sky-100 dark:border-white/10 overflow-hidden shadow-sm">
        {/* Panel Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Phân quyền theo vai trò
                </h2>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                  {filteredPermissions.length} quyền khả dụng
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Nhấp trực tiếp vào ô trạng thái để bật hoặc tắt quyền hạn. Quyền có biểu tượng ổ khóa là quyền cốt lõi hệ thống được cố định.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              {changedRoles.length > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setDraft(toMatrix(roles))}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Hoàn tác</span>
                </Button>
              )}
              <Button
                type="button"
                disabled={changedRoles.length === 0 || isSaving}
                onClick={save}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  changedRoles.length > 0
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20 hover:shadow-lg'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {isSaving
                  ? 'Đang lưu…'
                  : changedRoles.length > 0
                  ? `Lưu ${changedRoles.length} vai trò`
                  : 'Chưa có thay đổi'}
              </Button>
            </div>
          </div>

          {/* Search & Area Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm quyền hạn theo tên, mô tả hoặc mã key..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Dropdown/Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <select
                aria-label="Lọc theo nhóm danh mục"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 cursor-pointer"
              >
                <option value="all">Tất cả danh mục ({allAreas.length})</option>
                {allAreas.map((area) => (
                  <option key={area} value={area}>
                    {PERMISSION_AREA_LABEL[area] ?? area}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Permissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            {/* Table Column Headers */}
            <RoleColumnHeaders />

            {activeAreas.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={BACKEND_ROLES.length + 1} className="py-12 text-center text-slate-400">
                    Không tìm thấy quyền hạn nào khớp với từ khóa tìm kiếm.
                  </td>
                </tr>
              </tbody>
            ) : (
              activeAreas.map((area) => (
                <tbody key={area} className="divide-y divide-slate-100 dark:divide-white/5">
                  {/* Category Header Row */}
                  <tr className="bg-sky-50/60 dark:bg-sky-500/[0.06]">
                    <th
                      colSpan={BACKEND_ROLES.length + 1}
                      scope="colgroup"
                      className="px-6 py-2.5 text-left text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wide flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-sky-500" />
                      <span>{PERMISSION_AREA_LABEL[area] ?? area}</span>
                      <span className="text-[10px] font-normal text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/20 px-2 py-0.5 rounded-full ml-1 lowercase">
                        {filteredPermissions.filter((p) => p.area === area).length} quyền
                      </span>
                    </th>
                  </tr>

                  {/* Permission Rows */}
                  {filteredPermissions
                    .filter((p) => p.area === area)
                    .map((permission) => {
                      const meta = getPermissionMeta(permission.key, permission.description);

                      return (
                        <tr
                          key={permission.key}
                          className="hover:bg-slate-50/80 dark:hover:bg-white/[0.025] transition-colors"
                        >
                          {/* Permission Title & Info */}
                          <th scope="row" className="py-3.5 px-6 text-left font-normal align-middle">
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                              {meta.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {meta.desc}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200/50 dark:border-white/5">
                                {permission.key}
                              </span>
                            </div>
                          </th>

                          {/* Role Status Cells */}
                          {BACKEND_ROLES.map((role) => (
                            <PermissionCell
                              key={role}
                              role={role}
                              permission={permission}
                              title={meta.title}
                              isLocked={locked.get(role)?.has(permission.key) ?? false}
                              isGranted={draft[role].has(permission.key)}
                              onToggle={() => toggle(role, permission.key)}
                            />
                          ))}
                        </tr>
                      );
                    })}
                </tbody>
              ))
            )}
          </table>
        </div>
      </section>
    </div>
  );
}
