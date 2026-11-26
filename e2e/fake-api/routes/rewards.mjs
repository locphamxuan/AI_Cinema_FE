// Giải thưởng vòng quay (reward prizes): the Admin lists, adds, edits, toggles, rebalances and deletes wheel slots.
// A weight is a chance in basis points (10 000 = 100 %); the prizes switched on add up to 10 000, or none is on.
import { id, now, on, refuse } from '../core.mjs';

const FULL = 10000;
const lastActive = (db, keepId) => db.prizes.filter((p) => p.isActive && p.id !== keepId).length === 0;

/** Refuses a wheel whose prizes switched on would not add up to exactly 100 %, like the API. */
function assertAddsUp(weights) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (weights.length && total !== FULL) {
    throw refuse(409, `The prizes switched on would add up to ${total / 100}%, not 100%`, { reason: 'REWARD_WHEEL_NOT_100', totalBasisPoints: total });
  }
}
const othersOn = (db, exceptId) => db.prizes.filter((p) => p.isActive && p.id !== exceptId).map((p) => p.weight);

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
  if (created.isActive) assertAddsUp([...othersOn(db), created.weight]);
  db.prizes.push(created);
  return created;
}, ['ADMIN']);
on('PUT', '/admin/reward-prizes/chances', ({ db, body }) => {
  const listed = body.prizes ?? [];
  if (listed.some((l) => !db.prizes.some((p) => p.id === l.id))) throw refuse(404, 'Reward prize not found');
  assertAddsUp(listed.map((l) => Number(l.weight)));
  for (const p of db.prizes) {
    const mine = listed.find((l) => l.id === p.id);
    Object.assign(p, mine ? { weight: Number(mine.weight), isActive: true } : { isActive: false });
  }
  return db.prizes;
}, ['ADMIN']);
on('PATCH', '/admin/reward-prizes/:id', ({ db, params, body }) => {
  const p = db.prizes.find((x) => x.id === params.id);
  if (!p) throw refuse(404, 'Reward prize not found');
  const isActive = body.isActive ?? p.isActive;
  const weight = body.weight ?? p.weight;
  if ((p.isActive || isActive) && (isActive !== p.isActive || weight !== p.weight)) {
    assertAddsUp(isActive ? [...othersOn(db, p.id), weight] : othersOn(db, p.id));
  }
  Object.assign(p, body);
  return p;
}, ['ADMIN']);
on('DELETE', '/admin/reward-prizes/:id', ({ db, params }) => {
  const p = db.prizes.find((x) => x.id === params.id);
  if (!p) throw refuse(404, 'Reward prize not found');
  if (p.isActive && lastActive(db, p.id)) throw refuse(409, 'The last active prize cannot be deleted', { code: 'REWARD_PRIZE_LAST_ACTIVE' });
  if (p.isActive) assertAddsUp(othersOn(db, p.id));
  db.prizes.splice(db.prizes.indexOf(p), 1);
}, ['ADMIN']);
