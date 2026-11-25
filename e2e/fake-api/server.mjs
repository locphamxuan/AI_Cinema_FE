// A stand-in for the AI Cinema API, used only by the Playwright tests so they need no real backend. It answers
// the routes the back office calls with the shapes of the real API, keeps its data in memory, records every
// write (`GET /__test/calls`) and goes back to the seed on `POST /__test/reset`.
import { createServer } from 'node:http';
import { Refusal, routes, store } from './core.mjs';
import { seed } from './seed.mjs';
import './routes/auth.mjs';
import './routes/admin.mjs';
import './routes/studios.mjs';
import './routes/projects.mjs';
import './routes/project-work.mjs';
import './routes/script.mjs';
import './routes/costs.mjs';
import './routes/episodes.mjs';
import './routes/contracts.mjs';
import './routes/platform.mjs';
import './routes/policies.mjs';
import './routes/rewards.mjs';
import './routes/support.mjs';
import './routes/support-cases.mjs';
import './routes/reports.mjs';

const PORT = Number(process.env.FAKE_API_PORT ?? 3499);
store.db = seed();

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body === undefined || body === null ? undefined : JSON.stringify(body));
};

/** JSON bodies, or the fields and file names of a multipart form, read loosely as the tests need. */
async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('latin1');
  const type = req.headers['content-type'] ?? '';
  if (!text) return {};
  if (type.startsWith('application/json')) return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (!type.startsWith('multipart/form-data')) return {};
  const body = { files: [] };
  for (const part of text.split(/--[^\r\n]+\r\n/)) {
    const name = part.match(/name="([^"]+)"/)?.[1];
    if (!name) continue;
    const fileName = part.match(/filename="([^"]*)"/)?.[1];
    const value = part.split('\r\n\r\n').slice(1).join('\r\n\r\n').replace(/\r\n(--)?$/, '');
    if (fileName !== undefined) {
      const contentType = part.match(/Content-Type: ([^\r\n]+)/i)?.[1];
      body.files.push({ field: name, fileName: Buffer.from(fileName, 'latin1').toString('utf8'), contentType, size: value.length });
    } else body[name] = Buffer.from(value, 'latin1').toString('utf8');
  }
  return body;
}

async function route(req, res) {
  const url = new URL(req.url, 'http://fake');
  const path = url.pathname.replace(/^\/api/, '');
  const method = req.method;
  const body = await readBody(req);

  if (method === 'GET' && path === '/__health') return send(res, 200, { ok: true });
  if (method === 'POST' && path === '/__test/reset') {
    store.db = seed();
    store.calls = [];
    return send(res, 204);
  }
  if (method === 'GET' && path === '/__test/calls') return send(res, 200, store.calls);
  // Seed notifications for a user (the signed-in admin by default) so the notification centre has something to show.
  if (method === 'POST' && path === '/__test/notifications') {
    const userId = body.userId ?? store.db.users.find((u) => u.role === 'ADMIN')?.id;
    const count = Number(body.count ?? 1);
    for (let n = 1; n <= count; n += 1) {
      store.db.notifications.unshift({
        id: `notif-${n}-${Date.now()}`,
        userId,
        type: body.type ?? 'SYSTEM',
        title: body.title ?? `Thông báo thử ${n}`,
        body: null,
        link: body.link ?? '/admin/projects',
        readAt: null,
        createdAt: new Date(Date.now() - n * 1000).toISOString(),
      });
    }
    return send(res, 204);
  }

  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
  const user = store.db.users.find((u) => u.id === store.db.tokens.access[token]);
  for (const r of routes) {
    const match = r.method === method && r.pattern.exec(path);
    if (!match) continue;
    const isPublic = r.roles === 'public';
    if (!isPublic && !user) return send(res, 401, { error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    if (!isPublic && r.roles && !r.roles.includes(user.role)) {
      return send(res, 403, { error: { code: 'FORBIDDEN', message: 'You do not have permission to do this' } });
    }
    const params = Object.fromEntries(r.names.map((name, i) => [name, decodeURIComponent(match[i + 1])]));
    if (method !== 'GET') store.calls.push({ method, path, body, user: user?.email ?? null });
    try {
      const out = await r.handler({ db: store.db, user, body, params, query: url.searchParams, req, res });
      if (res.writableEnded) return;
      if (out?.__reply) return send(res, out.status, out.body);
      return send(res, out === undefined ? 204 : 200, out);
    } catch (error) {
      if (!(error instanceof Refusal)) throw error;
      return send(res, error.status, { error: { code: 'ERROR', message: error.message, details: error.details } });
    }
  }
  console.log(`[fake-api] no route for ${method} ${path}`);
  return send(res, 404, { error: { code: 'NOT_FOUND', message: `No fake route for ${method} ${path}` } });
}

createServer((req, res) => {
  route(req, res).catch((error) => send(res, 500, { error: { code: 'INTERNAL', message: String(error?.stack ?? error) } }));
}).listen(PORT, () => console.log(`fake AI Cinema API on http://localhost:${PORT}/api`));
