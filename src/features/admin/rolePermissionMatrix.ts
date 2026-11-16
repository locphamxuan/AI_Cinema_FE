import type { PermissionRow, RolePermissions } from '@/services/adminService';
import { BACKEND_ROLES, getPermissionMeta } from './roles';
import type { Matrix } from './components/RolePermissionParts';

/** Every web-known role gets a set, so a role the backend has not listed yet (e.g. a new STUDIO) reads as empty. */
export const toMatrix = (roles: RolePermissions[]) =>
  ({
    ...Object.fromEntries(BACKEND_ROLES.map((role) => [role, new Set<string>()])),
    ...Object.fromEntries(roles.map((r) => [r.role, new Set(r.permissions)])),
  }) as Matrix;

export const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((x) => b.has(x));

/** The permissions of one area (or all), matching the search in their key, Vietnamese title or description. */
export function filterPermissions(permissions: PermissionRow[], area: string, query: string): PermissionRow[] {
  const q = query.toLowerCase().trim();
  return permissions.filter((p) => {
    if (area !== 'all' && p.area !== area) return false;
    if (!q) return true;
    const meta = getPermissionMeta(p.key, p.description);
    return [p.key, meta.title, meta.desc, p.description].some((text) => text.toLowerCase().includes(q));
  });
}
