// What the MF-1 routes share: finding rows, the access rules of the API (project-access.service) and the shapes the
// API answers with (project detail, episode, contract, hand-off). Every route module of the production flow uses it.
import { now, person, refuse, store, userById } from './core.mjs';

export const OPEN_PROJECT = ['DRAFT', 'ASSIGNED', 'IN_PRODUCTION'];
export const DELIVERY_PROJECT = ['IN_PRODUCTION', 'UNDER_REVISION'];
export const OPEN_CONTRACT = ['SENT', 'STUDIO_SIGNED', 'ADMIN_COUNTERED'];

export function findProject(db, projectId) {
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) throw refuse(404, 'Movie project not found');
  return project;
}
export function findEpisode(db, episodeId) {
  const episode = db.episodes.find((e) => e.id === episodeId);
  if (!episode) throw refuse(404, 'Episode not found');
  return episode;
}

/**
 * The project if `user` may act on it as `need` asks: read (Admin, its Reviewer, a Creator of the team), reviewer
 * (the Reviewer in charge), lead (the lead Creator) or creator (any Creator of the team).
 */
export function projectFor(db, projectId, user, need = 'read') {
  const project = findProject(db, projectId);
  const reviewer = project.reviewerId === user.id;
  const lead = project.creatorId === user.id;
  const creator = lead || db.seats.some((s) => s.movieId === project.id && s.creatorId === user.id && s.isActive);
  const reads = user.role === 'ADMIN' || reviewer || creator;
  if (!reads) throw refuse(404, 'Movie project not found');
  if (need === 'reviewer' && !reviewer) throw refuse(403, 'Only the Content Reviewer in charge of this project can do that');
  if (need === 'lead' && !lead) throw refuse(403, 'Only the lead Creator of this project can do that');
  if (need === 'creator' && !creator) throw refuse(403, 'You do not have permission to do this');
  return project;
}

export function assertStatus(status, allowed, action) {
  if (!allowed.includes(status)) throw refuse(409, `Cannot ${action} while it is ${status} (expected ${allowed.join(' or ')})`);
}

export const touch = (project) => {
  project.updatedAt = now();
  project.lastActivityAt = project.updatedAt;
};

/** The production cost of a project: budget = sum of the entries, committed = fees the live hand-offs hold. */
export function costOf(db, projectId) {
  const budgetVnd = db.costEntries.filter((e) => e.projectId === projectId).reduce((sum, e) => sum + e.amountVnd, 0);
  const committedVnd = db.handoffs
    .filter((h) => h.movieId === projectId)
    .reduce((sum, h) => sum + (h.milestoneStatus === 'SUPERSEDED' ? h.forfeitedVnd : h.offeredFeeVnd), 0);
  return { budgetVnd, committedVnd, remainingVnd: budgetVnd - committedVnd };
}

export function episodeView(db, e) {
  const versions = db.media.filter((m) => m.episodeId === e.id).sort((a, b) => b.version - a.version);
  const creator = e.assignedCreatorId ? userById(e.assignedCreatorId) : null;
  return {
    ...e,
    assignedCreator: person(creator),
    mediaAssets: versions.slice(0, 1).map(({ id, version, ingestStatus, durationSeconds }) => ({ id, version, ingestStatus, durationSeconds })),
  };
}

function seasonStatus(episodes) {
  if (episodes.length && episodes.every((e) => e.status === 'PUBLISHED')) return 'COMPLETED';
  if (episodes.some((e) => e.revisionStartedAt)) return 'UNDER_REVISION';
  return episodes.some((e) => e.status !== 'DRAFT') ? 'IN_PRODUCTION' : 'DRAFT';
}

function seasonsOf(db, projectId) {
  return db.seasons
    .filter((s) => s.movieId === projectId)
    .sort((a, b) => a.seasonNumber - b.seasonNumber)
    .map((s) => {
      const episodes = db.episodes.filter((e) => e.seasonId === s.id).sort((a, b) => a.episodeNumber - b.episodeNumber);
      return { ...s, status: seasonStatus(episodes), episodes: episodes.map((e) => episodeView(db, e)) };
    });
}

export function seatView(db, seat) {
  return {
    ...seat,
    creator: person(userById(seat.creatorId)),
    assignedBy: person(userById(seat.assignedById)),
    delegatedFrom: person(seat.delegatedFromId ? userById(seat.delegatedFromId) : null),
    episodes: db.episodes
      .filter((e) => e.movieId === seat.movieId && e.assignedCreatorId === seat.creatorId)
      .map(({ id, episodeNumber, title, assignedCreatorId }) => ({ id, episodeNumber, title, assignedCreatorId })),
  };
}

export function contractView(db, c) {
  const project = findProject(db, c.projectId);
  const studio = db.studios.find((s) => s.id === c.studioId);
  const handoff = c.handoffId ? db.handoffs.find((h) => h.id === c.handoffId) : null;
  return {
    ...c,
    project: { id: project.id, reviewerId: project.reviewerId, creatorId: project.creatorId, movie: { title: project.title } },
    studio: { id: studio.id, name: studio.name },
    handoff: handoff ? { id: handoff.id, milestoneStatus: handoff.milestoneStatus } : null,
    createdBy: person(userById(c.createdById)),
    adminSignedBy: person(c.adminSignedById ? userById(c.adminSignedById) : null),
  };
}

export function handoffView(db, h) {
  const studio = db.studios.find((s) => s.id === h.studioId);
  return {
    ...h,
    studio: { id: studio.id, name: studio.name, email: studio.email },
    season: null,
    createdBy: person(userById(h.createdById)),
    contracts: db.contracts
      .filter((c) => c.handoffId === h.id)
      .sort((a, b) => a.round - b.round)
      .map(({ id, round, status, costVnd }) => ({ id, round, status, costVnd })),
  };
}

export function projectDetail(db, p) {
  const seasons = seasonsOf(db, p.id);
  const revising = seasons.map((s) => ({
    seasonNumber: s.seasonNumber,
    episodeNumbers: s.episodes.filter((e) => e.revisionStartedAt).map((e) => e.episodeNumber),
  }));
  const bySeason = revising.filter((s) => s.episodeNumbers.length > 0);
  return {
    ...p,
    ideaDescription: p.ideaDescription ?? 'Một câu chuyện điện ảnh về những người trẻ ở thành phố.',
    synopsis: p.synopsis ?? null,
    defaultLanguage: p.defaultLanguage ?? 'vi',
    ageRating: p.ageRating ?? null,
    releaseYear: p.releaseYear ?? null,
    cancelReason: p.cancelReason ?? null,
    handedOffAt: p.handedOffAt ?? null,
    completedAt: null,
    cancelledAt: p.cancelledAt ?? null,
    studio: p.studioId ? db.studios.find((s) => s.id === p.studioId) : null,
    reviewer: person(userById(p.reviewerId)),
    creator: person(p.creatorId ? userById(p.creatorId) : null),
    genres: p.genres ?? [],
    seasons,
    ideaFiles: db.ideaFiles.filter((f) => f.movieId === p.id),
    studioHandoffs: db.handoffs.filter((h) => h.movieId === p.id).map((h) => handoffView(db, h)),
    creatorAssignments: db.seats.filter((s) => s.movieId === p.id && s.isActive).map((s) => seatView(db, s)),
    cost: costOf(db, p.id),
    openChangeRequests: db.changeRequests.filter((r) => r.projectId === p.id && r.status === 'OPEN').length,
    revision: { episodeCount: bySeason.reduce((n, s) => n + s.episodeNumbers.length, 0), bySeason },
    _count: { episodes: seasons.reduce((n, s) => n + s.episodes.length, 0) },
  };
}

/** The project row as the list shows it, with its studio and people resolved. */
export function projectSummary(db, p) {
  const detail = projectDetail(db, p);
  return {
    id: p.id,
    title: p.title,
    status: p.status,
    posterUrl: p.posterUrl ?? null,
    studio: detail.studio,
    reviewerId: p.reviewerId,
    creatorId: p.creatorId,
    reviewer: detail.reviewer,
    creator: detail.creator,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    lastActivityAt: p.lastActivityAt,
    _count: detail._count,
  };
}

/** The Admins, whom most steps of the flow tell. */
export const adminIds = () => store.db.users.filter((u) => u.role === 'ADMIN').map((u) => u.id);
