// Sign-in, sessions and notifications: what every page of the back office calls.
import { id, now, on, paged, refuse } from '../core.mjs';

const profile = (u) => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role, isActive: u.isActive, permissions: u.permissions });

function issueSession(db, user) {
  const accessToken = `access-${id()}`;
  const refreshToken = `refresh-${id()}`;
  db.tokens.access[accessToken] = user.id;
  db.tokens.refresh[refreshToken] = user.id;
  return { accessToken, accessTokenExpiresIn: 1800, refreshToken, user: profile(user) };
}

on('POST', '/auth/login', ({ db, body }) => {
  const user = db.users.find((u) => u.email === String(body.email).toLowerCase());
  if (!user || user.password !== body.password) throw refuse(401, 'Incorrect email or password');
  if (!user.isActive) throw refuse(403, 'This account has been deactivated');
  return issueSession(db, user);
}, 'public');

on('POST', '/auth/refresh', ({ db, body }) => {
  const userId = db.tokens.refresh[body.refreshToken];
  if (!userId) throw refuse(401, 'Invalid refresh token');
  delete db.tokens.refresh[body.refreshToken];
  return issueSession(db, db.users.find((u) => u.id === userId));
}, 'public');

on('POST', '/auth/logout', ({ db, body }) => {
  delete db.tokens.refresh[body.refreshToken];
}, 'public');

on('GET', '/auth/me', ({ user }) => profile(user));

const mine = (db, user) => db.notifications.filter((n) => n.userId === user.id);
const TABS = { unread: (n) => !n.readAt, read: (n) => Boolean(n.readAt) };

on('GET', '/notifications', ({ db, user, query }) => {
  const filter = TABS[query.get('filter.readAt') === '$null' ? 'unread' : query.get('filter.readAt') === '$not:$null' ? 'read' : ''];
  const items = mine(db, user).filter(filter ?? (() => true));
  const type = query.get('filter.type');
  return paged(type ? items.filter((n) => `$in:${n.type}`.includes(type) || type.split(/[,:]/).includes(n.type)) : items, query);
});
on('GET', '/notifications/unread-count', ({ db, user }) => ({ unread: mine(db, user).filter((n) => !n.readAt).length }));
on('PATCH', '/notifications/read-all', ({ db, user }) => {
  const unread = mine(db, user).filter((n) => !n.readAt);
  for (const n of unread) n.readAt = now();
  return { updated: unread.length };
});
on('PATCH', '/notifications/:id/read', ({ db, user, params }) => {
  const item = mine(db, user).find((n) => n.id === params.id);
  if (!item) throw refuse(404, 'Notification not found');
  item.readAt ??= now();
});
