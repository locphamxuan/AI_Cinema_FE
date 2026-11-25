// The routing core of the fake AI Cinema API: each domain module registers its routes with `on`, a handler
// returns the JSON body (200), `reply(status, body)` for another status, or throws `refuse(...)` like the API.
import { randomUUID } from 'node:crypto';

export const routes = [];
export const store = { db: null, calls: [] };

/** Registers `METHOD /path/:param` for the users whose role is in `roles` (any signed-in user when omitted). */
export function on(method, path, handler, roles) {
  const names = [];
  const pattern = new RegExp(`^${path.replace(/:(\w+)/g, (_, name) => (names.push(name), '([^/]+)'))}$`);
  routes.push({ method, pattern, names, handler, roles });
}

export class Refusal extends Error {
  constructor(status, message, details) {
    super(message);
    Object.assign(this, { status, details });
  }
}
/** The error body of the real API: `{ error: { code, message, details } }`. */
export const refuse = (status, message, details) => new Refusal(status, message, details);
export const reply = (status, body) => ({ __reply: true, status, body });

export const id = () => randomUUID();
export const now = () => new Date().toISOString();
/** The paginated answer of the API (nestjs-paginate). */
export const paged = (data, query = new URLSearchParams()) => {
  const limit = Number(query.get('limit') ?? 20);
  const page = Number(query.get('page') ?? 1);
  return {
    data: data.slice((page - 1) * limit, page * limit),
    meta: { itemsPerPage: limit, totalItems: data.length, currentPage: page, totalPages: Math.max(1, Math.ceil(data.length / limit)) },
  };
};
export const person = (user) => (user ? { id: user.id, fullName: user.fullName, email: user.email } : null);
export const userById = (userId) => store.db.users.find((u) => u.id === userId);
/** Adds a notification for `userId`, as the API does after most steps of a flow. */
export function notify(userId, title, link = null, type = 'SYSTEM') {
  store.db.notifications.unshift({ id: id(), userId, type, title, body: null, link, readAt: null, createdAt: now() });
}
