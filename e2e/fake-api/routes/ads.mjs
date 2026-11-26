// Quảng cáo (MF-3): the Admin lists, creates, edits and pauses the mid-roll ads. An ad is a name and a video only;
// like the API (forbidNonWhitelisted), a click-through link or a pick weight is refused.
import { id, on, paged, refuse } from '../core.mjs';

const REMOVED = ['clickUrl', 'weight'];
const assertKnown = (body) => {
  const extra = REMOVED.filter((key) => key in body);
  if (extra.length) throw refuse(400, extra.map((key) => `property ${key} should not exist`).join(', '));
};

on('GET', '/admin/ads', ({ db, query }) => paged(db.ads, query), ['ADMIN']);
on('POST', '/admin/ads', ({ db, body }) => {
  assertKnown(body);
  const created = { id: id(), title: String(body.title ?? '').trim(), mediaUrl: String(body.mediaUrl), durationSeconds: 15, status: 'ACTIVE' };
  db.ads.unshift(created);
  return created;
}, ['ADMIN']);
on('PATCH', '/admin/ads/:id', ({ db, params, body }) => {
  assertKnown(body);
  const ad = db.ads.find((a) => a.id === params.id);
  if (!ad) throw refuse(404, 'Ad not found');
  Object.assign(ad, body);
  return ad;
}, ['ADMIN']);
