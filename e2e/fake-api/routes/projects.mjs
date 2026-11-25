// Movie projects (MF-1): the Admin lists them all, a Reviewer its own, a Creator the ones assigned to it.
import { id, now, on, paged, person, refuse } from '../core.mjs';

const SORT = { 'updatedAt:DESC': (a, b) => b.updatedAt.localeCompare(a.updatedAt) };

function detail(p) {
  return {
    ...p,
    ideaDescription: p.ideaDescription ?? '',
    synopsis: p.synopsis ?? null,
    defaultLanguage: p.defaultLanguage ?? 'vi',
    ageRating: p.ageRating ?? null,
    releaseYear: p.releaseYear ?? null,
    cancelReason: p.cancelReason ?? null,
    handedOffAt: null,
    completedAt: null,
    cancelledAt: null,
    genres: p.genres ?? [],
    seasons: [],
    ideaFiles: [],
    studioHandoffs: [],
    creatorAssignments: [],
    cost: { budgetVnd: p.budgetVnd ?? 0, committedVnd: 0, leftVnd: p.budgetVnd ?? 0, entries: [] },
    openChangeRequests: 0,
    revision: { episodeCount: 0, bySeason: [] },
  };
}

on('GET', '/projects', ({ db, user, query }) => {
  let items = db.projects;
  if (user.role === 'CONTENT_REVIEWER') items = items.filter((p) => p.reviewerId === user.id);
  else if (user.role === 'CONTENT_CREATOR') items = items.filter((p) => p.creatorId === user.id);

  const status = query.get('filter.status');
  if (status) {
    const want = status.replace(/^\$(eq|in):/, '').split(',');
    items = items.filter((p) => want.includes(p.status));
  }
  const search = query.get('search');
  if (search) items = items.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...items].sort(SORT[query.get('sortBy')] ?? SORT['updatedAt:DESC']);
  return paged(sorted, query);
});

on('POST', '/projects', ({ db, body }) => {
  const title = String(body.title ?? '').trim();
  if (!title) throw refuse(400, 'The project needs a title');
  const reviewer = db.users.find((u) => u.id === body.reviewerId);
  if (!reviewer) throw refuse(400, 'Pick an active Content Reviewer account');
  const creator = body.creatorId ? db.users.find((u) => u.id === body.creatorId) ?? null : null;
  const studio = body.studioId ? db.studios.find((s) => s.id === body.studioId) ?? null : null;
  const project = {
    id: id(),
    title,
    status: creator ? 'ASSIGNED' : 'DRAFT',
    posterUrl: null,
    studio,
    reviewerId: reviewer.id,
    creatorId: creator?.id ?? null,
    reviewer: person(reviewer),
    creator: person(creator),
    ideaDescription: body.ideaDescription ?? '',
    synopsis: body.synopsis ?? null,
    defaultLanguage: body.defaultLanguage ?? 'vi',
    ageRating: body.ageRating ?? null,
    releaseYear: body.releaseYear ?? null,
    budgetVnd: body.budgetVnd ?? 0,
    genres: db.genres.filter((g) => (body.genreIds ?? []).includes(g.id)),
    createdAt: now(),
    updatedAt: now(),
    lastActivityAt: now(),
    _count: { episodes: 0 },
  };
  db.projects.unshift(project);
  return detail(project);
}, ['ADMIN']);

on('GET', '/projects/:id', ({ db, params }) => {
  const p = db.projects.find((x) => x.id === params.id);
  if (!p) throw refuse(404, 'Movie project not found');
  return detail(p);
});

on('GET', '/genres', ({ db, query }) => paged(db.genres, query));
on('POST', '/genres', ({ db, body }) => {
  const name = String(body.name ?? '').trim();
  const found = db.genres.find((g) => g.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  const genre = { id: `g-${db.genres.length + 1}`, name, description: null };
  db.genres.push(genre);
  return genre;
});