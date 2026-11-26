// Chính sách (policies): the plain-text rules a Reviewer follows, managed by the Admin.
import { id, now, on, paged, refuse } from '../core.mjs';

const inForce = (p) => {
  if (!p.isActive) return false;
  const t = Date.now();
  if (p.effectiveFrom && Date.parse(p.effectiveFrom) > t) return false;
  if (p.effectiveTo && Date.parse(p.effectiveTo) <= t) return false;
  return true;
};

const matches = (p, query) => {
  const type = query.get('filter.type');
  if (type && type.replace(/^\$eq:/, '') !== p.type) return false;
  const active = query.get('filter.isActive');
  if (active && active.replace(/^\$eq:/, '') !== String(p.isActive)) return false;
  const search = query.get('search')?.trim().toLowerCase();
  if (search && !`${p.name} ${p.content} ${p.documentReference ?? ''}`.toLowerCase().includes(search)) return false;
  return true;
};

on('GET', '/policies', ({ db, query }) => paged(db.policies.filter((p) => matches(p, query)), query));
on('GET', '/policies/in-force', ({ db }) => db.policies.filter(inForce));
on('POST', '/policies', ({ db, body }) => {
  const t = now();
  const created = {
    id: id(),
    name: String(body.name ?? '').trim(),
    type: body.type ?? 'AI_LABELING',
    version: String(body.version ?? '1.0').trim(),
    documentReference: body.documentReference ?? null,
    content: String(body.content ?? ''),
    effectiveFrom: body.effectiveFrom ?? null,
    effectiveTo: body.effectiveTo ?? null,
    isActive: body.isActive ?? true,
    createdAt: t,
    updatedAt: t,
  };
  db.policies.unshift(created);
  return created;
}, ['ADMIN']);

on('PATCH', '/policies/:id', ({ db, params, body }) => {
  const p = db.policies.find((x) => x.id === params.id);
  if (!p) throw refuse(404, 'Policy not found');
  if (body.isActive === false && p.isActive) {
    const others = db.policies.filter((x) => x.type === p.type && x.id !== p.id && inForce(x));
    if (others.length === 0) throw refuse(409, 'The last policy in force of a type cannot be switched off', { code: 'POLICY_LAST_IN_FORCE' });
  }
  Object.assign(p, body, { updatedAt: now() });
  return p;
}, ['ADMIN']);

on('DELETE', '/policies/:id', ({ db, params }) => {
  const i = db.policies.findIndex((x) => x.id === params.id);
  if (i < 0) throw refuse(404, 'Policy not found');
  db.policies.splice(i, 1);
}, ['ADMIN']);