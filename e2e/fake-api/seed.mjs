// Seed of the fake AI Cinema API: a fresh copy of every account and record; each test starts from it.
import { people, U, DEFAULT_PERMISSIONS } from './seed/people.mjs';

const AT = '2026-10-01T03:00:00.000Z';

const person = (u) => (u ? { id: u.id, fullName: u.fullName, email: u.email } : null);
const studio = (u) => ({ id: `studio-${u.id}`, name: u.fullName, email: u.email, phone: '0900000000', isActive: true });
const policy = (pid, name, type) => ({
  id: pid,
  name,
  type,
  version: '1.0',
  documentReference: null,
  content: `Ná»™i dung ${name}.`,
  effectiveFrom: null,
  effectiveTo: null,
  isActive: true,
  createdAt: AT,
  updatedAt: AT,
});

function project(id, title, status, fields) {
  return {
    id,
    title,
    status,
    posterUrl: null,
    studio: null,
    reviewerId: U.reviewer.id,
    creatorId: null,
    reviewer: person(U.reviewer),
    creator: null,
    createdAt: AT,
    updatedAt: AT,
    lastActivityAt: AT,
    _count: { episodes: 0 },
    ...fields,
  };
}

export function seed() {
  const projects = [
    project('11111111-1111-4111-8111-000000000001', 'Ánh sáng cuối', 'IN_PRODUCTION', {
      studio: studio(U.studio),
      creatorId: U.creator.id,
      creator: person(U.creator),
      _count: { episodes: 3 },
    }),
    project('11111111-1111-4111-8111-000000000002', 'Mùa đông ấm', 'DRAFT', {
      _count: { episodes: 0 },
    }),
    project('11111111-1111-4111-8111-000000000003', 'Bến cảng', 'COMPLETED', {
      studio: studio(U.studio),
      reviewerId: U.reviewer2.id,
      reviewer: person(U.reviewer2),
      creatorId: U.creator2.id,
      creator: person(U.creator2),
      _count: { episodes: 2 },
    }),
  ];
  return {
    users: people(),
    tokens: { access: {}, refresh: {} },
    notifications: [],
    projects,
    studios: [{ id: `studio-${U.studio.id}`, name: U.studio.fullName, email: U.studio.email, phone: '0900000000', isActive: true }],
    roles: Object.fromEntries(Object.entries(DEFAULT_PERMISSIONS).map(([r, p]) => [r, [...p]])),
    genres: [
      { id: 'g1', name: 'HÃ nh Ä‘á»™ng', description: null },
      { id: 'g2', name: 'TÃ¢m lÃ½', description: null },
    ],
    policies: [
      policy('pol-ai', 'Quy Ä‘á»‹nh gáº¯n nhuÃ£n AI', 'AI_LABELING'),
      policy('pol-content', 'Quy Ä‘á»‹nh ná»™i dung', 'CONTENT_POLICY'),
      policy('pol-legal', 'Quy Ä‘á»‹nh phÃ¡p lÃ½', 'LEGAL'),
    ],
  };
}