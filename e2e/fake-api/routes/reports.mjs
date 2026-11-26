// Báo cáo & tài chính (reports/finance): the Admin dashboard and the finance screens read these.
import { now, on, paged, person, refuse, userById } from '../core.mjs';

const range = (query) => ({ from: query.get('from') ?? null, to: query.get('to') ?? null });

on('GET', '/admin/reports/revenue', ({ query }) => ({
  ...range(query),
  totals: { paidCycles: 0, coins: 0, mainCoins: 0, bonusCoins: 0 },
  byPlan: [],
}));
on('GET', '/admin/reports/churn', ({ query }) => ({
  ...range(query),
  started: 0,
  renewed: 0,
  ended: 0,
  cancelledByMember: 0,
  cancelledByAdmin: 0,
  expiredForPayment: 0,
  expiredUnused: 0,
  failedRenewals: 0,
}));
const FILMS = [
  {
    movieId: '11111111-1111-4111-8111-000000000001',
    title: 'Ánh sáng cuối',
    studioName: 'Lumen Studio',
    createdAt: '2026-10-01T03:00:00.000Z',
    productionCostVnd: 100000000,
    episodeSalesVnd: 150000000,
    refundedVnd: 0,
    planShareVnd: 20000000,
    revenueVnd: 170000000,
    profitVnd: 70000000,
    breakEven: 'BROKE_EVEN',
  },
  {
    movieId: '11111111-1111-4111-8111-000000000002',
    title: 'Mùa Đông ấm',
    studioName: null,
    createdAt: '2026-10-01T03:00:00.000Z',
    productionCostVnd: 0,
    episodeSalesVnd: 50000000,
    refundedVnd: 0,
    planShareVnd: 0,
    revenueVnd: 50000000,
    profitVnd: 50000000,
    breakEven: 'NO_COST',
  },
];

on('GET', '/admin/finance/films', () => ({
  currentPeriod: '2026-10',
  lastSharedPeriod: null,
  totals: {
    productionCostVnd: 100000000,
    episodeSalesVnd: 200000000,
    planShareVnd: 20000000,
    revenueVnd: 220000000,
    profitVnd: 120000000,
    marginPercent: 54.5,
    costedMovies: 1,
    brokeEvenMovies: 1,
  },
  films: FILMS,
}));
const RULES = [
  { code: 'LARGE_TOP_UP', description: 'Nạp từ 5.000.000 VND trở lên trong một lần' },
  { code: 'RAPID_UNLOCKS', description: '15 lượt mở khóa tập trở lên trong 10 phút từ một ví' },
];
const flagView = (f) => {
  const user = userById(f.userId);
  return {
    ...f,
    coinTransaction: { ...f.coinTransaction, wallet: { id: `wallet-${user.id}`, user: { ...person(user), isActive: user.isActive } } },
    reviewedBy: person(f.reviewedById ? userById(f.reviewedById) : null),
  };
};
on('GET', '/admin/finance/risk/rules', () => RULES, ['ADMIN']);
/** The first scan finds the seeded unlock burst; later scans find nothing new, like the real unique index. */
on('POST', '/admin/finance/risk/scan', ({ db }) => {
  const fresh = db.riskFlags.filter((f) => f.pendingScan);
  fresh.forEach((f) => delete f.pendingScan);
  const rules = RULES.map((r) => ({ ...r, created: fresh.filter((f) => f.ruleCode === r.code).length })).filter((r) => r.created);
  return { created: fresh.length, rules };
}, ['ADMIN']);
on('GET', '/admin/finance/risk/flags', ({ db, query }) => {
  const status = query.get('filter.status')?.replace(/^\$eq:/, '');
  const visible = db.riskFlags.filter((f) => !f.pendingScan && (!status || f.status === status));
  return paged(visible.map(flagView), query);
}, ['ADMIN']);
/** ACCOUNT_LOCKED locks the member and drops every token, so the member is signed out at once. */
on('POST', '/admin/finance/risk/flags/:id/review', ({ db, user, params, body }) => {
  const flag = db.riskFlags.find((f) => f.id === params.id);
  if (!flag) throw refuse(404, 'Flag not found');
  if (flag.status !== 'OPEN') throw refuse(409, `The flag is already ${flag.status}`);
  const note = String(body.note ?? '').trim();
  if (body.decision === 'ACCOUNT_LOCKED') {
    if (!note) throw refuse(400, 'note should not be empty');
    userById(flag.userId).isActive = false;
    for (const kind of ['access', 'refresh']) {
      for (const [token, owner] of Object.entries(db.tokens[kind])) if (owner === flag.userId) delete db.tokens[kind][token];
    }
  }
  Object.assign(flag, { status: body.decision, reviewNote: note || null, reviewedById: user.id, reviewedAt: now() });
  return flagView(flag);
}, ['ADMIN']);