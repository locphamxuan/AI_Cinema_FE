// Work on one project before and around production (MF-1 §1): the lead Creator, seasons and episodes, idea files,
// notes, the Creator team, cancelling, and the change requests sent to the Admin (BR-55).
import { id, notify, now, on, person, refuse, userById } from '../core.mjs';
import { OPEN_PROJECT, assertStatus, episodeView, findEpisode, findProject, projectFor, seatView, touch } from '../production.mjs';

const ROLES_PLANNING = ['ADMIN', 'CONTENT_REVIEWER', 'CONTENT_CREATOR'];
/** The extensions the API takes for idea and synopsis files (idea-file.service IDEA_FILE_KINDS). */
const IDEA_EXTENSIONS = ['.pdf', '.doc', '.docx', '.rtf', '.txt', '.xlsx', '.pptx', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif', '.mp4', '.m4v', '.mov', '.webm', '.mkv', '.avi'];

function newEpisode(db, movieId, seasonId, input, episodeNumber) {
  if (!String(input.title ?? '').trim()) throw refuse(400, 'Give the episode a title');
  if (!input.deliveryDeadline) throw refuse(400, 'Set the delivery deadline of the episode');
  const episode = {
    id: id(), movieId, seasonId, assignedCreatorId: null, episodeNumber, title: input.title.trim(), synopsis: input.synopsis ?? null,
    thumbnailUrl: null, status: 'DRAFT', targetDurationSeconds: input.targetDurationSeconds, deliveryDeadline: input.deliveryDeadline,
    dueDate: null, expectedReleaseDate: input.expectedReleaseDate ?? null, approvedMediaAssetId: null, coinPrice: null,
    isFreeForGuest: false, isFreeForMember: false, finalConfirmedAt: null, finalConfirmedById: null, finalRejectionNote: null,
    revisionStartedAt: null, createdAt: now(), updatedAt: now(),
  };
  db.episodes.push(episode);
  return episode;
}

// ---- Lead Creator and cancelling (Admin) ----
on('POST', '/projects/:id/assign', ({ db, params, body, user }) => {
  const project = findProject(db, params.id);
  assertStatus(project.status, OPEN_PROJECT, 'assign a Content Creator to a project');
  const creator = db.users.find((u) => u.id === body.creatorId && u.role === 'CONTENT_CREATOR' && u.isActive);
  if (!creator) throw refuse(400, 'Pick an active CONTENT_CREATOR account');
  for (const seat of db.seats.filter((s) => s.movieId === project.id && s.isLead)) seat.isLead = false;
  const seat = db.seats.find((s) => s.movieId === project.id && s.creatorId === creator.id);
  if (seat) Object.assign(seat, { isLead: true, isActive: true });
  else db.seats.push({ id: id(), movieId: project.id, creatorId: creator.id, isActive: true, isLead: true, note: null, assignedAt: now(), unassignedAt: null, delegatedFromId: null, assignedById: user.id });
  project.creatorId = creator.id;
  if (project.status === 'DRAFT') project.status = 'ASSIGNED';
  touch(project);
  notify(creator.id, `Bạn được giao làm Creator chính của "${project.title}".`, `/projects/${project.id}`);
}, ['ADMIN']);

on('POST', '/projects/:id/cancel', ({ db, params, body }) => {
  const project = findProject(db, params.id);
  assertStatus(project.status, OPEN_PROJECT, 'cancel a project');
  if (!String(body.reason ?? '').trim()) throw refuse(400, 'Give the reason for cancelling');
  if (db.episodes.some((e) => e.movieId === project.id && e.status === 'PUBLISHED')) {
    throw refuse(409, 'An episode of this project was already published (BR-39)');
  }
  Object.assign(project, { status: 'CANCELLED', cancelReason: body.reason.trim(), cancelledAt: now() });
  for (const c of db.contracts.filter((x) => x.projectId === project.id && ['SENT', 'STUDIO_SIGNED', 'ADMIN_COUNTERED'].includes(x.status))) c.status = 'SUPERSEDED';
  touch(project);
}, ['ADMIN']);

on('GET', '/projects/:id/events', ({ db, user, params }) => (projectFor(db, params.id, user), []));

// ---- Seasons and episodes (the Reviewer in charge, while the project is open) ----
on('POST', '/projects/:id/seasons', ({ db, user, params, body }) => {
  const project = projectFor(db, params.id, user, 'reviewer');
  assertStatus(project.status, OPEN_PROJECT, 'add a season');
  const seasons = db.seasons.filter((s) => s.movieId === project.id);
  const season = {
    id: id(), movieId: project.id, seasonNumber: seasons.length + 1, title: body.title ?? null,
    releaseStartDate: body.releaseStartDate ?? null, releaseEndDate: body.releaseEndDate ?? null,
  };
  if (!(body.episodes ?? []).length) throw refuse(400, 'A season needs at least one episode');
  db.seasons.push(season);
  let next = db.episodes.filter((e) => e.movieId === project.id).length + 1;
  for (const input of body.episodes) newEpisode(db, project.id, season.id, input, next++);
  touch(project);
  return season;
}, ['CONTENT_REVIEWER']);

on('POST', '/seasons/:id/episodes', ({ db, user, params, body }) => {
  const season = db.seasons.find((s) => s.id === params.id);
  if (!season) throw refuse(404, 'Season not found');
  const project = projectFor(db, season.movieId, user, 'reviewer');
  assertStatus(project.status, OPEN_PROJECT, 'add an episode');
  const episode = newEpisode(db, project.id, season.id, body, db.episodes.filter((e) => e.movieId === project.id).length + 1);
  touch(project);
  return episodeView(db, episode);
}, ['CONTENT_REVIEWER']);

// ---- Idea and synopsis files ----
on('POST', '/projects/:id/idea-files', ({ db, user, params, body, query }) => {
  const file = body.files?.find((f) => f.field === 'file');
  if (!file?.size) throw refuse(400, 'Attach a file in the "file" field');
  const project = projectFor(db, params.id, user, 'reviewer');
  assertStatus(project.status, OPEN_PROJECT, 'add idea files');
  const extension = file.fileName.slice(file.fileName.lastIndexOf('.')).toLowerCase();
  if (!IDEA_EXTENSIONS.includes(extension)) {
    throw refuse(400, `The file must be one of ${IDEA_EXTENSIONS.join(', ')}, and its content must match its extension`);
  }
  const versions = db.ideaFiles.filter((f) => f.movieId === project.id && f.fileName === file.fileName);
  const saved = {
    id: id(), movieId: project.id, fileName: file.fileName, purpose: query.get('purpose') ?? 'IDEA', version: versions.length + 1,
    mimeType: file.contentType, sizeBytes: file.size, createdAt: now(),
  };
  db.ideaFiles.push(saved);
  touch(project);
  return saved;
}, ['CONTENT_REVIEWER']);

// ---- Notes on the idea (Admin, lead Creator, Reviewer in charge) ----
const notesOf = (db, projectId) =>
  db.notes.filter((n) => n.projectId === projectId).map((n) => {
    const author = userById(n.authorId);
    return { id: n.id, message: n.message, createdAt: n.createdAt, author: { id: author.id, fullName: author.fullName, role: author.role } };
  });
on('GET', '/projects/:id/notes', ({ db, user, params }) => notesOf(db, projectFor(db, params.id, user).id));
on('POST', '/projects/:id/notes', ({ db, user, params, body }) => {
  const project = projectFor(db, params.id, user);
  if (!(user.role === 'ADMIN' || project.creatorId === user.id || project.reviewerId === user.id)) {
    throw refuse(403, 'Only the Admin, the lead Creator and the Reviewer write on the project');
  }
  const message = String(body.message ?? '').trim();
  if (!message) throw refuse(400, 'Write a message');
  db.notes.push({ id: id(), projectId: project.id, authorId: user.id, message, createdAt: now() });
  return notesOf(db, project.id);
}, ROLES_PLANNING);

// ---- The Creator team (BR-13) ----
const teamOf = (db, projectId) => db.seats.filter((s) => s.movieId === projectId).map((s) => seatView(db, s));
on('GET', '/creators', ({ db }) => db.users.filter((u) => u.role === 'CONTENT_CREATOR' && u.isActive).map(person));
on('GET', '/projects/:id/creators', ({ db, user, params }) => teamOf(db, projectFor(db, params.id, user).id));
on('POST', '/projects/:id/creators', ({ db, user, params, body }) => {
  const project = projectFor(db, params.id, user, 'reviewer');
  if (!project.creatorId) throw refuse(409, 'Assign the lead Content Creator first');
  const creator = db.users.find((u) => u.id === body.creatorId && u.role === 'CONTENT_CREATOR' && u.isActive);
  if (!creator) throw refuse(400, 'Pick an active Content Creator account');
  if (!db.seats.some((s) => s.movieId === project.id && s.creatorId === creator.id && s.isActive)) {
    db.seats.push({ id: id(), movieId: project.id, creatorId: creator.id, isActive: true, isLead: false, note: body.note ?? null, assignedAt: now(), unassignedAt: null, delegatedFromId: null, assignedById: user.id });
  }
  touch(project);
  return teamOf(db, project.id);
}, ['ADMIN', 'CONTENT_REVIEWER']);
on('PUT', '/episodes/:id/assignee', ({ db, user, params, body }) => {
  const episode = findEpisode(db, params.id);
  const project = projectFor(db, episode.movieId, user);
  if (project.reviewerId !== user.id && project.creatorId !== user.id) {
    throw refuse(403, 'Only the Reviewer or the lead Creator can give an episode to a Creator');
  }
  if (body.creatorId && !db.seats.some((s) => s.movieId === project.id && s.creatorId === body.creatorId && s.isActive)) {
    throw refuse(400, 'That Creator is not on this project');
  }
  episode.assignedCreatorId = body.creatorId ?? null;
  touch(project);
  return episodeView(db, episode);
}, ['CONTENT_REVIEWER', 'CONTENT_CREATOR']);

// ---- Change requests to the Admin (BR-55) ----
function requestView(db, r) {
  const project = findProject(db, r.projectId);
  return {
    ...r,
    requestedBy: person(userById(r.requestedById)),
    resolvedBy: person(r.resolvedById ? userById(r.resolvedById) : null),
    season: null,
    episode: null,
    project: { id: project.id, reviewerId: project.reviewerId, creatorId: project.creatorId, movie: { title: project.title } },
  };
}
on('GET', '/projects/:id/change-requests', ({ db, user, params }) =>
  db.changeRequests.filter((r) => r.projectId === projectFor(db, params.id, user).id).map((r) => requestView(db, r)));
on('GET', '/change-requests', ({ db, query }) => {
  const status = query.get('status');
  return db.changeRequests.filter((r) => !status || r.status === status).map((r) => requestView(db, r));
}, ['ADMIN']);
function decide(db, user, requestId, status, response) {
  const request = db.changeRequests.find((r) => r.id === requestId);
  if (!request) throw refuse(404, 'Change request not found');
  if (request.status !== 'OPEN') throw refuse(409, `The request is already ${request.status}`);
  Object.assign(request, { status, adminResponse: response || null, resolvedAt: now(), resolvedById: user.id });
  notify(request.requestedById, status === 'APPROVED' ? 'Admin đã duyệt đề xuất của bạn.' : 'Admin từ chối đề xuất của bạn.');
  return requestView(db, request);
}
on('POST', '/change-requests/:id/approve', ({ db, user, params, body }) => decide(db, user, params.id, 'APPROVED', body.response), ['ADMIN']);
on('POST', '/change-requests/:id/reject', ({ db, user, params, body }) => {
  if (!String(body.response ?? '').trim()) throw refuse(400, 'Say why the request is rejected');
  return decide(db, user, params.id, 'REJECTED', body.response.trim());
}, ['ADMIN']);

/** STUDIO logins of a studio: the account whose email is the studio's. */
on('GET', '/studios/:id/accounts', ({ db, params }) => {
  const studio = db.studios.find((s) => s.id === params.id);
  if (!studio) throw refuse(404, 'Studio not found');
  return db.users
    .filter((u) => u.role === 'STUDIO' && u.email === studio.email)
    .map((u) => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role, isActive: u.isActive, studioId: studio.id, createdAt: u.createdAt }));
}, ['ADMIN']);

