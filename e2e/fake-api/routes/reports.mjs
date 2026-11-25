// Báo cáo & tài chính (reports/finance): the Admin dashboard and the finance screens read these.
import { on, paged } from '../core.mjs';

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
    roiPercent: 70,
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
    roiPercent: null,
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
    roiPercent: 54.5,
    marginPercent: 54.5,
    costedMovies: 1,
    brokeEvenMovies: 1,
  },
  films: FILMS,
}));
on('GET', '/admin/finance/risk/rules', () => []);
on('POST', '/admin/finance/risk/scan', () => ({ created: 0 }));
on('GET', '/admin/finance/risk/flags', ({ query }) => paged([], query));