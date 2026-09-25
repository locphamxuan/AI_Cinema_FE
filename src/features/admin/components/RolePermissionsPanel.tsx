import { useEffect, useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { adminService, type PermissionRow, type RolePermissions } from '@/services/adminService';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { UserRole } from '@/types/workflow-api-enums';
import { BACKEND_ROLE_LABEL, BACKEND_ROLES, PERMISSION_AREA_LABEL } from '../roles';

type Matrix = Record<UserRole, Set<string>>;

const toMatrix = (roles: RolePermissions[]) =>
  Object.fromEntries(roles.map((r) => [r.role, new Set(r.permissions)])) as Matrix;

const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((x) => b.has(x));

/** Which role holds which permission; the Admin ticks boxes, then saves the roles that changed. */
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
  if (!draft) return <p className="text-xs text-slate-500 dark:text-slate-400">Đang tải bảng phân quyền…</p>;

  return (
    <section className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Phân quyền theo vai trò</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bỏ chọn một ô là vai trò đó mất quyền ngay sau khi lưu. Ô có khoá là quyền Admin luôn giữ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {changedRoles.length > 0 && (
            <Button type="button" variant="secondary" onClick={() => setDraft(toMatrix(roles))} className="px-3 py-2 rounded-xl text-xs">
              Hoàn tác
            </Button>
          )}
          <Button type="button" disabled={changedRoles.length === 0 || isSaving} onClick={save} className="px-4 py-2 rounded-xl text-xs">
            {isSaving ? 'Đang lưu…' : changedRoles.length > 0 ? `Lưu ${changedRoles.length} vai trò` : 'Chưa có thay đổi'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.03]">
            <tr>
              <th scope="col" className="py-2.5 px-5 text-left font-semibold">Quyền</th>
              {BACKEND_ROLES.map((role) => (
                <th key={role} scope="col" className="py-2.5 px-3 font-semibold whitespace-nowrap">
                  {BACKEND_ROLE_LABEL[role]}
                  {changedRoles.includes(role) && <span className="ml-1 text-amber-500" title="Chưa lưu">•</span>}
                </th>
              ))}
            </tr>
          </thead>
          {areas.map((area) => (
            <tbody key={area} className="divide-y divide-slate-100 dark:divide-white/5">
              <tr>
                <th colSpan={BACKEND_ROLES.length + 1} scope="colgroup" className="px-5 pt-4 pb-1.5 text-left text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  {PERMISSION_AREA_LABEL[area] ?? area}
                </th>
              </tr>
              {permissions
                .filter((p) => p.area === area)
                .map((permission) => (
                  <tr key={permission.key}>
                    <th scope="row" className="py-2 px-5 text-left font-normal">
                      <p className="text-slate-800 dark:text-slate-200">{permission.description}</p>
                      <p className="text-[10px] font-mono text-slate-400">{permission.key}</p>
                    </th>
                    {BACKEND_ROLES.map((role) => {
                      const isLocked = locked.get(role)?.has(permission.key) ?? false;
                      return (
                        <td key={role} className="py-2 px-3 text-center">
                          {isLocked ? (
                            <Lock className="w-3.5 h-3.5 mx-auto text-slate-400" aria-label={`${BACKEND_ROLE_LABEL[role]} luôn giữ quyền này`} />
                          ) : (
                            <input
                              type="checkbox"
                              checked={draft[role].has(permission.key)}
                              onChange={() => toggle(role, permission.key)}
                              aria-label={`${BACKEND_ROLE_LABEL[role]}: ${permission.description}`}
                              className="w-4 h-4 accent-purple-600 cursor-pointer"
                            />
                          )}
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
