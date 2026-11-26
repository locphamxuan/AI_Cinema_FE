// Hỗ trợ & trợ lý AI (support / AI console): knowledge base, health, playground and answer log.
import { id, now, on, paged, refuse } from '../core.mjs';

const detail = (a) => ({
  slug: a.slug,
  audience: a.audience ?? 'MEMBER',
  source: a.source ?? 'MANUAL',
  contentMarkdown: a.contentMarkdown ?? '',
  indexStatus: a.indexStatus ?? 'READY',
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
  ...a,
});

on('GET', '/admin/support/ai/health', () => ({
  mode: 'live',
  chatModel: 'fake-chat',
  chatConfigured: true,
  embeddingModel: 'fake-embed',
  embeddingConfigured: true,
  indexedChunks: 0,
  failedArticles: 0,
  pendingArticles: 0,
  lastIndexedAt: null,
}));
on('GET', '/admin/support/knowledge', ({ db, query }) => {
  const type = query.get('filter.status');
  const cat = query.get('filter.category');
  const search = query.get('search')?.trim().toLowerCase();
  const items = db.knowledge.filter((a) => {
    if (type && type.replace(/^\$eq:/, '') !== a.status) return false;
    if (cat && cat.replace(/^\$eq:/, '') !== a.category) return false;
    if (search && !`${a.title} ${a.contentMarkdown ?? ''}`.toLowerCase().includes(search)) return false;
    return true;
  });
  return paged(items, query);
});
on('GET', '/admin/support/knowledge/:id', ({ db, params }) => {
  const a = db.knowledge.find((x) => x.id === params.id);
  if (!a) throw refuse(404, 'Knowledge article not found');
  return detail(a);
});
on('POST', '/admin/support/knowledge', ({ db, body }) => {
  const t = now();
  const created = {
    id: id(),
    slug: String(body.slug ?? id()),
    title: String(body.title ?? '').trim(),
    category: String(body.category ?? '').trim(),
    contentMarkdown: String(body.contentMarkdown ?? ''),
    status: body.status ?? 'DRAFT',
    indexStatus: 'READY',
    audience: body.audience ?? 'MEMBER',
    source: body.source ?? 'MANUAL',
    createdAt: t,
    updatedAt: t,
  };
  db.knowledge.unshift(created);
  return detail(created);
}, ['ADMIN']);
on('PATCH', '/admin/support/knowledge/:id', ({ db, params, body }) => {
  const a = db.knowledge.find((x) => x.id === params.id);
  if (!a) throw refuse(404, 'Knowledge article not found');
  Object.assign(a, body, { updatedAt: now() });
  return detail(a);
}, ['ADMIN']);
on('POST', '/admin/support/knowledge/:id/archive', ({ db, params }) => {
  const a = db.knowledge.find((x) => x.id === params.id);
  if (!a) throw refuse(404, 'Knowledge article not found');
  a.status = 'ARCHIVED';
  a.updatedAt = now();
  return detail(a);
}, ['ADMIN']);
on('POST', '/admin/support/knowledge/:id/reindex', ({ db, params }) => {
  const a = db.knowledge.find((x) => x.id === params.id);
  if (!a) throw refuse(404, 'Knowledge article not found');
  a.indexStatus = 'READY';
  return { id: a.id, indexStatus: a.indexStatus };
}, ['ADMIN']);
on('DELETE', '/admin/support/knowledge/:id', ({ db, params }) => {
  const i = db.knowledge.findIndex((x) => x.id === params.id);
  if (i < 0) throw refuse(404, 'Knowledge article not found');
  db.knowledge.splice(i, 1);
  return { id: params.id, deleted: true };
}, ['ADMIN']);

// Playground and answer log are not used by the knowledge CRUD spec; minimal shapes so other tabs load.
on('POST', '/admin/support/ai/preview-chat', ({ body }) => ({
  answer: `Phản hồi cho: ${String(body.question ?? '')}`,
  messageId: id(),
  sources: [],
}));
on('GET', '/admin/support/ai/answers/summary', () => ({ total: 0, unrated: 0, notHelpful: 0 }));
on('GET', '/admin/support/ai/answers', ({ query }) => paged([], query));
on('POST', '/admin/support/ai/answers/:id/feedback', ({ params, body }) => ({
  id: params.id,
  aiFeedback: body.rating,
  aiFeedbackNote: body.note ?? null,
  aiFeedbackAt: now(),
}));