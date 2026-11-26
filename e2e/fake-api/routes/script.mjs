// The script of a project (MF-1 §2, script.service): the lead Creator submits versions, the Reviewer in charge
// approves or sends back, the Admin approves the Final Script, which sends the studio its template contract.
import { id, notify, now, on, person, refuse, userById } from '../core.mjs';
import { adminIds, assertStatus, costOf, projectFor, touch } from '../production.mjs';

const WRITABLE = [null, 'REVISION_REQUESTED'];

function scriptView(db, projectId) {
  const script = db.scripts.find((s) => s.projectId === projectId);
  if (!script) return null;
  return {
    projectId,
    status: script.status,
    currentVersion: script.currentVersion,
    finalizedAt: script.finalizedAt,
    versions: [...script.versions].reverse().map((v) => ({ ...v, submittedBy: person(userById(v.submittedById)) })),
    reviews: [...script.reviews].reverse().map((r) => ({ ...r, reviewer: person(userById(r.reviewerId)) })),
  };
}

/** The script in the expected status: a double click cannot review the same version twice. */
function scriptIn(db, projectId, expected) {
  const script = db.scripts.find((s) => s.projectId === projectId);
  if (script?.status !== expected) throw refuse(409, `The script is ${script?.status ?? 'not submitted'}; expected ${expected}`);
  return script;
}

function review(script, stage, user, approved, comment) {
  script.reviews.push({ id: id(), version: script.currentVersion, stage, approved, comment: comment || null, createdAt: now(), reviewerId: user.id });
}

/** The round the studio receives when the Final Script is approved: no cost yet, the budget left as its ceiling. */
export function sendTemplate(db, project, user, terms) {
  if (db.contracts.some((c) => c.projectId === project.id && ['SENT', 'STUDIO_SIGNED', 'ADMIN_COUNTERED', 'SIGNED'].includes(c.status))) {
    throw refuse(409, 'This project already has a contract');
  }
  const contract = {
    id: id(), projectId: project.id, studioId: project.studioId, handoffId: null, round: 1, previousId: null, costVnd: null,
    ceilingVnd: costOf(db, project.id).remainingVnd, proposedBy: null, status: 'SENT',
    terms: terms?.trim() || 'Studio sản xuất đúng Kịch bản Final và tiến độ đã thống nhất.', adminSignedAt: null,
    adminSignedById: null, studioSignedAt: null, createdAt: now(), createdById: user.id, documents: [],
  };
  db.contracts.push(contract);
  const studio = db.studios.find((s) => s.id === project.studioId);
  const login = db.users.find((u) => u.role === 'STUDIO' && u.email === studio.email);
  if (login) notify(login.id, `Hợp đồng mẫu của phim "${project.title}" đang chờ Studio ký.`, '/contracts');
  return contract;
}

on('GET', '/projects/:id/script', ({ db, user, params }) => scriptView(db, projectFor(db, params.id, user).id));

on('POST', '/projects/:id/script/versions', ({ db, user, params, body }) => {
  const project = projectFor(db, params.id, user, 'lead');
  assertStatus(project.status, ['ASSIGNED'], 'write the script');
  const content = String(body.content ?? '').trim();
  if (!content) throw refuse(400, 'Write the script');
  let script = db.scripts.find((s) => s.projectId === project.id);
  if (!WRITABLE.includes(script?.status ?? null)) throw refuse(409, `The script is ${script.status}; wait for its review`);
  if (!script) db.scripts.push((script = { projectId: project.id, status: 'SUBMITTED', currentVersion: 0, finalizedAt: null, versions: [], reviews: [] }));
  script.currentVersion += 1;
  script.status = 'SUBMITTED';
  script.versions.push({ id: id(), version: script.currentVersion, content, note: body.note || null, createdAt: now(), submittedById: user.id });
  notify(project.reviewerId, `Creator đã nộp kịch bản bản ${script.currentVersion}, chờ Reviewer duyệt.`, `/projects/${project.id}/script`);
  touch(project);
  return scriptView(db, project.id);
}, ['CONTENT_CREATOR']);

on('POST', '/projects/:id/script/review', ({ db, user, params, body }) => {
  const project = projectFor(db, params.id, user, 'reviewer');
  assertStatus(project.status, ['ASSIGNED'], 'review the script');
  if (!body.approve && !String(body.comment ?? '').trim()) throw refuse(400, 'Say what to change (comment)');
  const script = scriptIn(db, project.id, 'SUBMITTED');
  review(script, 'REVIEWER', user, !!body.approve, body.comment);
  script.status = body.approve ? 'REVIEWER_APPROVED' : 'REVISION_REQUESTED';
  if (body.approve) for (const admin of adminIds()) notify(admin, `Reviewer đã duyệt kịch bản bản ${script.currentVersion}; mời Admin xem xét Kịch bản Final.`);
  else notify(project.creatorId, `Reviewer yêu cầu sửa kịch bản: ${body.comment}`);
  touch(project);
  return scriptView(db, project.id);
}, ['CONTENT_REVIEWER']);

on('POST', '/projects/:id/script/final-review', ({ db, user, params, body }) => {
  const project = projectFor(db, params.id, user);
  assertStatus(project.status, ['ASSIGNED'], 'approve the Final Script');
  if (!body.approve && !String(body.comment ?? '').trim()) throw refuse(400, 'Say what to change (comment)');
  if (body.approve) {
    const studioId = body.studioId ?? project.studioId;
    if (!studioId) throw refuse(409, 'Pick the studio to send the contract to (studioId)');
    const episodes = db.episodes.filter((e) => e.movieId === project.id);
    if (!episodes.length) throw refuse(409, 'The Reviewer must plan at least one episode first');
    if (episodes.some((e) => !e.deliveryDeadline)) throw refuse(409, 'Every episode needs a delivery deadline before the studio is contracted');
    project.studioId = studioId;
  }
  const script = scriptIn(db, project.id, 'REVIEWER_APPROVED');
  review(script, 'ADMIN', user, !!body.approve, body.comment);
  script.status = body.approve ? 'FINAL' : 'REVISION_REQUESTED';
  if (body.approve) {
    script.finalizedAt = now();
    sendTemplate(db, project, user, body.terms);
  }
  for (const who of [project.creatorId, project.reviewerId]) {
    notify(who, body.approve ? `Admin đã duyệt Kịch bản Final (bản ${script.currentVersion}).` : `Admin yêu cầu sửa kịch bản: ${body.comment}`);
  }
  touch(project);
  return scriptView(db, project.id);
}, ['ADMIN']);
