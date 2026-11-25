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
on('GET', '/admin/finance/films', () => ({
  currentPeriod: '2026-10',
  lastSharedPeriod: null,
  totals: {
    productionCostVnd: 0,
    episodeSalesVnd: 0,
    planShareVnd: 0,
    revenueVnd: 0,
    profitVnd: 0,
    roiPercent: null,
    marginPercent: null,
    costedMovies: 0,
    brokeEvenMovies: 0,
  },
  films: [],
}));
on('GET', '/admin/finance/risk/rules', () => []);
on('POST', '/admin/finance/risk/scan', () => ({ created: 0 }));
on('GET', '/admin/finance/risk/flags', ({ query }) => paged([], query));