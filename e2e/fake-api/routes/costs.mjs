// Production cost in VND (production-cost.service, cost-request.service) and the studio hand-offs with a studio
// change (studio-handoff.service): the budget the Admin sets once, the Reviewer's requests for more, the timeline.
import { id, notify, now, on, person, refuse, userById } from '../core.mjs';
import { DELIVERY_PROJECT, OPEN_CONTRACT, adminIds, assertStatus, costOf, findProject, handoffView, projectFor, touch } from '../production.mjs';

const ledger = (db, projectId) => ({
  ...costOf(db, projectId),
  entries: db.costEntries
    .filter((e) => e.projectId === projectId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((e) => ({ ...e, createdBy: person(userById(e.createdById)) })),
});
const thousands = (value) => Number.isInteger(value) && value % 1000 === 0;

on('GET', '/projects/:id/costs', ({ db, user, params }) => ledger(db, projectFor(db, params.id, user).id), ['ADMIN', 'CONTENT_REVIEWER']);

on('POST', '/projects/:id/costs/entries', ({ db, user, params, body }) => {
  const project = findProject(db, params.id);
  const amountVnd = Number(body.amountVnd);
  if (!thousands(amountVnd)) throw refuse(400, 'The amount must be a whole number of thousands of VND');
  const { budgetVnd, committedVnd } = costOf(db, project.id);
  if (body.entryType === 'BUDGET') {
    if (budgetVnd > 0) throw refuse(409, 'The budget was already set; correct it instead');
    if (amountVnd <= 0) throw refuse(400, 'The budget must be above 0 VND');
  } else {
    if (!budgetVnd) throw refuse(409, 'Set the budget first');
    if (!String(body.reason ?? '').trim()) throw refuse(400, 'A correction needs a reason (BR-46)');
    if (budgetVnd + amountVnd < committedVnd) throw refuse(400, 'The budget cannot drop below what the studios hold');
  }
  db.costEntries.push({ id: id(), projectId: project.id, entryType: body.entryType, amountVnd, reason: body.reason ?? null, createdAt: now(), createdById: user.id, request: null });
  notify(project.reviewerId, `Admin đã cập nhật ngân sách sản xuất của "${project.title}".`);
  touch(project);
  return ledger(db, project.id);
}, ['ADMIN']);

// ---- "Yêu cầu thêm chi phí sản xuất" ----
function requestView(db, r) {
  const project = findProject(db, r.projectId);
  const handoff = r.handoffId ? db.handoffs.find((h) => h.id === r.handoffId) : null;
  const studio = handoff && db.studios.find((s) => s.id === handoff.studioId);
  return {
    ...r,
    project: { id: project.id, reviewerId: project.reviewerId, movie: { title: project.title } },
    handoff: handoff ? { id: handoff.id, offeredFeeVnd: handoff.offeredFeeVnd, milestoneStatus: handoff.milestoneStatus, studio: { id: studio.id, name: studio.name } } : null,
    requestedBy: person(userById(r.requestedById)),
    resolvedBy: person(r.resolvedById ? userById(r.resolvedById) : null),
  };
}
function requestPage(db, rows, query) {
  const page = Number(query.get('page') ?? 1);
  const limit = Number(query.get('limit') ?? 20);
  const status = query.get('status');
  const items = rows.filter((r) => !status || r.status === status).sort((a, b) => (a.status === 'OPEN' ? -1 : 0) - (b.status === 'OPEN' ? -1 : 0));
  return {
    data: items.slice((page - 1) * limit, page * limit).map((r) => requestView(db, r)),
    meta: { page, limit, total: items.length, totalPages: Math.max(1, Math.ceil(items.length / limit)) },
  };
}

on('POST', '/projects/:id/cost-requests', ({ db, user, params, body }) => {
  const project = projectFor(db, params.id, user, 'reviewer');
  if (!body.files?.some((f) => f.field === 'proof' && f.size)) throw refuse(400, 'Attach the studio quote or another proof (proof)');
  if (db.costRequests.some((r) => r.projectId === project.id && r.status === 'OPEN')) {
    throw refuse(409, 'This project already has an open cost request; wait for the answer');
  }
  const requestedVnd = Number(body.requestedVnd);
  if (!(requestedVnd > 0) || !thousands(requestedVnd)) throw refuse(400, 'The amount must be a whole number of thousands of VND');
  const request = {
    id: id(), projectId: project.id, handoffId: body.handoffId || null, requestedVnd, studioQuoteVnd: body.studioQuoteVnd ? Number(body.studioQuoteVnd) : null,
    grantedVnd: null, reason: String(body.reason ?? '').trim(), attachmentName: body.files.find((f) => f.field === 'proof').fileName,
    status: 'OPEN', adminResponse: null, resolvedAt: null, createdAt: now(), requestedById: user.id, resolvedById: null,
  };
  db.costRequests.push(request);
  for (const admin of adminIds()) notify(admin, `Reviewer xin thêm chi phí sản xuất cho "${project.title}".`);
  return requestView(db, request);
}, ['CONTENT_REVIEWER']);
on('GET', '/projects/:id/cost-requests', ({ db, user, params, query }) =>
  requestPage(db, db.costRequests.filter((r) => r.projectId === projectFor(db, params.id, user).id), query), ['ADMIN', 'CONTENT_REVIEWER']);
on('GET', '/cost-requests', ({ db, user, query }) =>
  requestPage(db, db.costRequests.filter((r) => user.role === 'ADMIN' || findProject(db, r.projectId).reviewerId === user.id), query), ['ADMIN', 'CONTENT_REVIEWER']);

function openRequest(db, requestId) {
  const request = db.costRequests.find((r) => r.id === requestId);
  if (!request) throw refuse(404, 'Cost request not found');
  if (request.status !== 'OPEN') throw refuse(409, 'This request was already answered');
  return request;
}
on('POST', '/cost-requests/:id/approve', ({ db, user, params, body }) => {
  const request = openRequest(db, params.id);
  const grantedVnd = Number(body.grantedVnd ?? request.requestedVnd);
  if (grantedVnd > request.requestedVnd) throw refuse(400, 'You cannot grant more than the Reviewer asked for');
  Object.assign(request, { status: 'APPROVED', grantedVnd, adminResponse: body.response ?? null, resolvedAt: now(), resolvedById: user.id });
  db.costEntries.push({
    id: id(), projectId: request.projectId, entryType: 'ADDITIONAL', amountVnd: grantedVnd, reason: request.reason, createdAt: now(), createdById: user.id,
    request: { id: request.id, requestedVnd: request.requestedVnd, studioQuoteVnd: request.studioQuoteVnd },
  });
  notify(request.requestedById, `Admin đã cấp thêm ${grantedVnd} ₫.`);
  touch(findProject(db, request.projectId));
  return requestView(db, request);
}, ['ADMIN']);
on('POST', '/cost-requests/:id/reject', ({ db, user, params, body }) => {
  const request = openRequest(db, params.id);
  if (!String(body.response ?? '').trim()) throw refuse(400, 'Say why the request is rejected');
  Object.assign(request, { status: 'REJECTED', adminResponse: body.response.trim(), resolvedAt: now(), resolvedById: user.id });
  return requestView(db, request);
}, ['ADMIN']);

// ---- Hand-offs and the studio change (BR-58, BR-59) ----
on('GET', '/projects/:id/handoffs', ({ db, user, params }) => {
  const project = projectFor(db, params.id, user);
  return db.handoffs.filter((h) => h.movieId === project.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((h) => handoffView(db, h));
}, ['ADMIN', 'CONTENT_REVIEWER', 'CONTENT_CREATOR']);
on('GET', '/projects/:id/handoffs/:handoffId/brief', ({ res }) => {
  res.writeHead(200, { 'Content-Type': 'application/pdf' });
  res.end('%PDF-1.4\n%%EOF\n');
}, ['ADMIN', 'CONTENT_REVIEWER']);

on('POST', '/projects/:id/studio-change', ({ db, user, params, body }) => {
  const project = findProject(db, params.id);
  assertStatus(project.status, DELIVERY_PROJECT, 'change the studio');
  const reason = String(body.reason ?? '').trim();
  if (reason.length < 5) throw refuse(400, 'Say why the studio changes (reason)');
  const email = String(body.studioEmail ?? '').trim().toLowerCase();
  let studio = body.studioId ? db.studios.find((s) => s.id === body.studioId) : db.studios.find((s) => s.email === email);
  if (!studio) {
    studio = { id: id(), name: body.studioName, email, contactName: null, phone: body.studioPhone || null, note: null, isActive: true, createdAt: now() };
    db.studios.push(studio);
  }
  if (studio.id === project.studioId) throw refuse(409, 'Pick another studio than the current one');
  const replaced = db.handoffs.filter((h) => h.movieId === project.id && h.milestoneStatus !== 'SUPERSEDED');
  const forfeitedVnd = Number(body.forfeitedVnd ?? 0);
  const offeredFeeVnd = Number(body.offeredFeeVnd);
  const maxVnd = costOf(db, project.id).remainingVnd + replaced.reduce((n, h) => n + h.offeredFeeVnd, 0) - forfeitedVnd;
  if (!(offeredFeeVnd > 0) || offeredFeeVnd > maxVnd) throw refuse(409, 'The fee is above the production budget left');
  for (const h of replaced) Object.assign(h, { milestoneStatus: 'SUPERSEDED', forfeitedVnd: Math.min(forfeitedVnd, h.offeredFeeVnd) });
  for (const c of db.contracts.filter((x) => x.projectId === project.id && OPEN_CONTRACT.includes(x.status))) c.status = 'SUPERSEDED';
  const handoff = {
    id: id(), movieId: project.id, studioId: studio.id, seasonId: null, offeredFeeVnd, forfeitedVnd: 0, changeReason: reason,
    briefFileKey: `briefs/${project.id}-${studio.id}.pdf`, milestoneStatus: 'BRIEF_SENT', statusNote: null, respondedAt: null, declineReason: null,
    createdAt: now(), createdById: user.id, emailMessage: { status: 'SENT', sentAt: now(), errorMessage: null }, materials: [], milestoneEvents: [],
  };
  db.handoffs.push(handoff);
  db.contracts.push({
    id: id(), projectId: project.id, studioId: studio.id, handoffId: handoff.id, round: 1, previousId: null, costVnd: null, ceilingVnd: offeredFeeVnd,
    proposedBy: null, status: 'SENT', terms: 'Studio sản xuất đúng Kịch bản Final.', adminSignedAt: null, adminSignedById: null,
    studioSignedAt: null, createdAt: now(), createdById: user.id, documents: [],
  });
  project.studioId = studio.id;
  notify(project.reviewerId, `Admin đã đổi Studio của "${project.title}": ${reason}`);
  touch(project);
  return handoffView(db, handoff);
}, ['ADMIN']);
