// Movie projects (MF-1): the Admin lists them all, a Reviewer its own, a Creator the ones assigned to it.
import { id, now, on, paged, refuse } from '../core.mjs';
import { projectDetail, projectFor, projectSummary } from '../production.mjs';

const SORT = { 'updatedAt:DESC': (a, b) => b.updatedAt.localeCompare(a.updatedAt) };

on('GET', '/projects', ({ db, user, query }) => {
  let items = db.projects;
  if (user.role === 'CONTENT_REVIEWER') items = items.filter((p) => p.reviewerId === user.id);
  else if (user.role === 'CONTENT_CREATOR') {
    const seated = (p) => db.seats.some((s) => s.movieId === p.id && s.creatorId === user.id && s.isActive);
    items = items.filter((p) => p.creatorId === user.id || seated(p));
  }

  const status = query.get('filter.status');
  if (status) {
    const want = status.replace(/^\$(eq|in):/, '').split(',');
    items = items.filter((p) => want.includes(p.status));
  }
  const search = query.get('search');
  if (search) items = items.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...items].sort(SORT[query.get('sortBy')] ?? SORT['updatedAt:DESC']);
  return paged(sorted.map((p) => projectSummary(db, p)), query);
});

on('POST', '/projects', ({ db, user, body }) => {
  const title = String(body.title ?? '').trim();
  if (!title) throw refuse(400, 'The project needs a title');
  const reviewer = db.users.find((u) => u.id === body.reviewerId);
  if (!reviewer) throw refuse(400, 'Pick an active Content Reviewer account');
  const creator = body.creatorId ? db.users.find((u) => u.id === body.creatorId) ?? null : null;
  const project = {
    id: id(),
    title,
    status: creator ? 'ASSIGNED' : 'DRAFT',
    posterUrl: null,
    studioId: body.studioId ?? null,
    reviewerId: reviewer.id,
    creatorId: creator?.id ?? null,
    ideaDescription: body.ideaDescription ?? '',
    synopsis: body.synopsis ?? null,
    defaultLanguage: body.defaultLanguage ?? 'vi',
    ageRating: body.ageRating ?? null,
    releaseYear: body.releaseYear ?? null,
    genres: db.genres.filter((g) => (body.genreIds ?? []).includes(g.id)),
    createdAt: now(),
    updatedAt: now(),
    lastActivityAt: now(),
  };
  if (body.budgetVnd) {
    db.costEntries.push({ id: id(), projectId: project.id, entryType: 'BUDGET', amountVnd: Number(body.budgetVnd), reason: null, createdAt: now(), createdById: user.id, request: null });
  }
  db.projects.unshift(project);
  return projectDetail(db, project);
}, ['ADMIN']);

on('GET', '/projects/:id', ({ db, user, params }) => projectDetail(db, projectFor(db, params.id, user)));

on('GET', '/genres', ({ db, query }) => paged(db.genres, query));
on('POST', '/genres', ({ db, body }) => {
  const name = String(body.name ?? '').trim();
  const found = db.genres.find((g) => g.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  const genre = { id: `g-${db.genres.length + 1}`, name, description: null };
  db.genres.push(genre);
  return genre;
});