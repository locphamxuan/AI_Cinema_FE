// Giải thưởng vòng quay (reward prizes): the Admin lists, adds, edits, toggles and deletes wheel slots.
import { id, now, on, refuse } from '../core.mjs';

const lastActive = (db, keepId) => db.prizes.filter((p) => p.isActive && p.id !== keepId).length === 0;

on('GET', '/admin/reward-prizes', ({ db }) => db.prizes);
on('POST', '/admin/reward-prizes', ({ db, body }) => {
  const created = {
    id: id(),
    code: String(body.code ?? id()),
    name: String(body.name ?? '').trim(),
    type: body.type ?? 'BONUS_COIN',
    bonusCoins: body.type === 'PLAN_DAYS' ? null : Number(body.bonusCoins ?? 0),
    planDays: body.type === 'PLAN_DAYS' ? Number(body.planDays ?? 0) : null,
    weight: Number(body.weight ?? 1),
    isActive: body.isActive ?? true,
    createdAt: now(),
  };
  db.prizes.push(created);
  return created;
}, ['ADMIN']);
on('PATCH', '/admin/reward-prizes/:id', ({ db, params, body }) => {
  const p = db.prizes.find((x) => x.id === params.id);
  if (!p) throw refuse(404, 'Reward prize not found');
  Object.assign(p, body);
  return p;
}, ['ADMIN']);
on('DELETE', '/admin/reward-prizes/:id', ({ db, params }) => {
  const p = db.prizes.find((x) => x.id === params.id);
  if (!p) throw refuse(404, 'Reward prize not found');
  if (p.isActive && lastActive(db, p.id)) throw refuse(409, 'The last active prize cannot be deleted', { code: 'REWARD_PRIZE_LAST_ACTIVE' });
  db.prizes.splice(db.prizes.indexOf(p), 1);
}, ['ADMIN']);