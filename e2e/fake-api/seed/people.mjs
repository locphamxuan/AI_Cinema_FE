// The accounts of the fake API: one per back-office role, plus the accounts the back office must refuse.
// Default permissions per role as the API seeds them (AI-_Cinema_BE DEFAULT_ROLE_PERMISSIONS).
const PERMISSIONS = {
  CONTENT_CREATOR: ['project:suggest', 'script:write', 'media:ingest'],
  CONTENT_REVIEWER: ['project:manage', 'project:suggest', 'cost:request', 'content:review', 'contract:document.read', 'genre:manage', 'user:read'],
  STAFF: ['member:ops.read', 'access.episode.read', 'wallet.read', 'coin.wallet.read', 'coin.transaction.read', 'billing.subscription.read', 'support:case.read', 'support:case.manage'],
  ADMIN: ['project:create', 'project:read.all', 'script:approve', 'studio:manage', 'episode:price', 'episode:publish', 'project:change.review', 'cost:approve', 'cost:adjust', 'contract:manage', 'contract:document.read', 'price-alert:manage', 'genre:manage', 'user:read', 'user:manage', 'role:manage', 'platform:settings.manage', 'access.episode.read', 'wallet.read', 'billing.plan.manage', 'billing.price.manage', 'billing.subscription.read', 'billing.subscription.cancel', 'coin.wallet.read', 'coin.refund', 'coin.transaction.read', 'reward.rule.manage', 'analytics.revenue.read', 'analytics.churn.read', 'finance:report.read', 'risk:flag.manage', 'ad.manage', 'support:case.read', 'support:case.manage', 'support:case.assign', 'support:knowledge.manage'],
  MEMBER: ['access.episode.read', 'wallet.read', 'wallet.topup', 'reward.checkin', 'subscription.self.manage', 'support:chat', 'watch-party:use'],
  STUDIO: ['studio:portal'],
};
export const DEFAULT_PERMISSIONS = PERMISSIONS;

export const PASSWORD = 'Aicinema@123';
const AT = '2026-10-01T03:00:00.000Z';

function account(n, role, email, fullName, fields = {}) {
  const uid = `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
  return { id: uid, email, fullName, role, password: PASSWORD, isActive: true, permissions: [...PERMISSIONS[role]], createdAt: AT, phone: null, lastLoginAt: null, ...fields };
}

export const U = {
  admin: account(1, 'ADMIN', 'admin@aicinema.vn', 'Quản trị Một'),
  reviewer: account(2, 'CONTENT_REVIEWER', 'reviewer@aicinema.vn', 'Reviewer Một'),
  reviewer2: account(3, 'CONTENT_REVIEWER', 'reviewer2@aicinema.vn', 'Reviewer Hai'),
  creator: account(4, 'CONTENT_CREATOR', 'creator@aicinema.vn', 'Creator Một'),
  creator2: account(5, 'CONTENT_CREATOR', 'creator2@aicinema.vn', 'Creator Hai'),
  staff: account(6, 'STAFF', 'staff@aicinema.vn', 'Staff Một'),
  member: account(7, 'MEMBER', 'member@aicinema.vn', 'Member Một'),
  studio: account(8, 'STUDIO', 'studio@aicinema.vn', 'Lumen Studio'),
  locked: account(9, 'CONTENT_REVIEWER', 'locked@aicinema.vn', 'Reviewer Bị Khoá', { isActive: false }),
};

export const people = () => Object.values(U).map((u) => ({ ...u, permissions: [...u.permissions] }));
