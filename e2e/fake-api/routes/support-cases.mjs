// The support desk of Staff and the Admin (MF-5, support conversation services): the queue, claiming a case, the
// AI draft, replies, resolving (a repeated resolve is a no-op, D-14) and the member's read-only context.
import { id, now, on, paged, refuse } from '../core.mjs';

const DESK = ['STAFF', 'ADMIN'];

function caseOf(db, caseId) {
  const found = db.supportCases.find((c) => c.id === caseId);
  if (!found) throw refuse(404, 'Support case not found');
  return found;
}
const say = (db, c, senderType, content, isInternal = false) => {
  const message = { id: id(), caseId: c.id, senderType, content, isInternal, aiMetadata: null, createdAt: now() };
  db.supportMessages.push(message);
  Object.assign(c, { lastMessageAt: message.createdAt, updatedAt: message.createdAt });
  return message;
};
const messagesOf = (db, caseId) => db.supportMessages.filter((m) => m.caseId === caseId);

on('GET', '/admin/support/conversations', ({ db, query }) => {
  const status = query.get('filter.status')?.replace(/^\$eq:/, '');
  const assignee = query.get('filter.assignedAgentId');
  const items = db.supportCases.filter((c) => {
    if (status && c.status !== status) return false;
    if (assignee === '$null') return !c.assignedAgentId;
    return !assignee || c.assignedAgentId === assignee.replace(/^\$eq:/, '');
  });
  return paged(items, query);
}, DESK);
on('GET', '/admin/support/stats', ({ db }) => {
  const byStatus = {};
  for (const c of db.supportCases) byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
  return { byStatus, waiting: byStatus.WAITING_FOR_STAFF ?? 0, oldestWaiting: null, escalatedToday: 0, resolvedToday: 0, aiResolvedRate: 0 };
}, DESK);
on('GET', '/admin/support/conversations/:id', ({ db, params }) => {
  const c = caseOf(db, params.id);
  return { conversation: c, messages: messagesOf(db, c.id) };
}, DESK);
on('GET', '/admin/support/conversations/:id/member-context', ({ db, params }) => {
  const c = caseOf(db, params.id);
  const sections = Object.fromEntries(Object.entries(db.memberContext).map(([key, data]) => [key, { data }]));
  return { memberId: c.memberId, sections: { ...sections, EpisodeAccess: { data: [] } } };
}, DESK);

on('POST', '/admin/support/conversations/:id/claim', ({ db, user, params }) => {
  const c = caseOf(db, params.id);
  if (c.status !== 'WAITING_FOR_STAFF') throw refuse(409, 'This case was already claimed');
  Object.assign(c, { status: 'STAFF_HANDLING', assignedAgentId: user.id, assignedAgentName: user.fullName, claimedAt: now() });
  say(db, c, 'SYSTEM', `${user.fullName} đã nhận yêu cầu`);
  return c;
}, DESK);
on('POST', '/admin/support/conversations/:id/ai-suggestion', ({ db, params }) => {
  caseOf(db, params.id);
  return {
    draft: 'Chào bạn, giao dịch nạp 50.000 đ đã được ghi nhận và 50 Coin đã vào ví của bạn.',
    confidence: 0.82,
    grounded: true,
    sources: [{ articleId: 'kb-1', title: 'Bài mẫu', heading: null }],
  };
}, DESK);
on('POST', '/admin/support/conversations/:id/messages', ({ db, user, params, body }) => {
  const c = caseOf(db, params.id);
  if (c.status !== 'STAFF_HANDLING' || (c.assignedAgentId !== user.id && user.role !== 'ADMIN')) {
    throw refuse(409, 'Claim the case before replying');
  }
  const content = String(body.content ?? '').trim();
  if (!content) throw refuse(400, 'Write a message');
  const message = say(db, c, 'SUPPORT_AGENT', content, !!body.isInternal);
  return { conversation: c, message };
}, DESK);
on('POST', '/admin/support/conversations/:id/resolve', ({ db, user, params, body }) => {
  const c = caseOf(db, params.id);
  // D-14: resolving or closing again changes nothing and writes nothing.
  if (c.status === 'RESOLVED' || c.status === 'CLOSED') return c;
  if (c.status !== 'STAFF_HANDLING') throw refuse(409, 'Claim the case before resolving it');
  Object.assign(c, { status: 'RESOLVED', resolvedAt: now(), resolutionNote: body.note ?? null });
  say(db, c, 'SYSTEM', `${user.fullName} đã báo giải quyết xong, chờ Member xác nhận`);
  return c;
}, DESK);

/** Correcting a wallet by hand needs coin.adjust, which only the Admin holds. */
on('POST', '/admin/wallet-adjustments', ({ body }) => ({ ...body, applied: true }), ['ADMIN']);
