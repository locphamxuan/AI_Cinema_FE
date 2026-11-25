// Accounts and permissions (Admin): the user list, the permission catalog and the role -> permissions map.
import { on, paged, refuse } from '../core.mjs';
import { DEFAULT_PERMISSIONS } from '../seed/people.mjs';

const account = (u) => ({
  id: u.id,
  email: u.email,
  fullName: u.fullName,
  role: u.role,
  isActive: u.isActive,
  phone: u.phone ?? null,
  createdAt: u.createdAt,
  lastLoginAt: u.lastLoginAt ?? null,
});

on('GET', '/users', ({ db, query }) => {
  let items = db.users;
  const role = query.get('filter.role');
  if (role) {
    const want = role.replace(/^\$(eq|in):/, '');
    items = items.filter((u) => want.split(',').includes(u.role));
  }
  const active = query.get('filter.isActive');
  if (active) {
    const want = active.replace(/^\$eq:/, '') === 'true';
    items = items.filter((u) => u.isActive === want);
  }
  const search = query.get('search');
  if (search) {
    const q = search.toLowerCase();
    items = items.filter((u) => u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q));
  }
  return paged(items.map(account), query);
});

const CATALOG = [
  { key: 'project:create', area: 'movie-project', description: 'Tạo dự án phim' },
  { key: 'project:read.all', area: 'movie-project', description: 'Xem mọi dự án' },
  { key: 'user:read', area: 'administration', description: 'Xem tài khoản' },
  { key: 'user:manage', area: 'administration', description: 'Quản lý tài khoản' },
  { key: 'role:manage', area: 'administration', description: 'Phân quyền theo vai trò' },
];
on('GET', '/permissions', () => CATALOG);
on('GET', '/roles', ({ db }) =>
  Object.entries(db.roles).map(([role, permissions]) => ({
    role,
    permissions,
    lockedPermissions: role === 'ADMIN' ? ['user:manage', 'role:manage'] : [],
  })),
);
on('PUT', '/roles/:role/permissions', ({ db, params, body }) => {
  const role = params.role;
  if (!(role in DEFAULT_PERMISSIONS)) throw refuse(404, 'Role not found');
  const permissions = Array.isArray(body.permissions) ? body.permissions : [];
  db.roles[role] = permissions;
  return { role, permissions, lockedPermissions: role === 'ADMIN' ? ['user:manage', 'role:manage'] : [] };
}, ['ADMIN']);