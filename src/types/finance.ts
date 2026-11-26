/** MF-5 Financial Dashboard (BE src/modules/platform/finance). Every amount is whole VND. */

/** NO_COST: no production cost recorded yet, so ROI and break-even do not apply. */
export type BreakEvenStatus = 'NO_COST' | 'BROKE_EVEN' | 'NOT_YET';

export interface FilmFinance {
  movieId: string;
  title: string;
  /** Studio and creation date tell apart two films with the same title. */
  studioName: string | null;
  createdAt: string;
  productionCostVnd: number;
  /** Main Coin spent unlocking episodes, refunds already taken off; bonus Coin is not revenue. */
  episodeSalesVnd: number;
  refundedVnd: number;
  /** Share of the monthly-plan revenue, months already shared only. */
  planShareVnd: number;
  revenueVnd: number;
  profitVnd: number;
  /** null while the film has no production cost. */
  roiPercent: number | null;
  breakEven: BreakEvenStatus;
}

export interface FilmFinanceReport {
  /** "YYYY-MM", the running month in Vietnam: its plan revenue is shared at the start of next month. */
  currentPeriod: string;
  /** Latest month whose plan revenue was shared; null before the first one. */
  lastSharedPeriod: string | null;
  totals: {
    productionCostVnd: number;
    episodeSalesVnd: number;
    planShareVnd: number;
    revenueVnd: number;
    profitVnd: number;
    roiPercent: number | null;
    /** Profit / revenue in percent; null without revenue. */
    marginPercent: number | null;
    costedMovies: number;
    brokeEvenMovies: number;
  };
  films: FilmFinance[];
}

export interface RiskRule {
  code: string;
  description: string;
}

/** CONFIRMED only on flags handled before 26/11/2026; today the Admin locks the account or dismisses. */
export type RiskFlagStatus = 'OPEN' | 'ACCOUNT_LOCKED' | 'DISMISSED' | 'CONFIRMED';

/** What the Admin does with an open flag. */
export type RiskDecision = 'ACCOUNT_LOCKED' | 'DISMISSED';

/** POST /admin/finance/risk/scan: the new flags in all and per rule. */
export interface RiskScanResult {
  created: number;
  rules: { code: string; description: string; created: number }[];
}

export interface RiskFlag {
  id: string;
  ruleCode: string;
  reason: string;
  status: RiskFlagStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  coinTransaction: {
    id: string;
    entryType: string;
    mainAmount: number;
    bonusAmount: number;
    rateVnd: number | null;
    createdAt: string;
    wallet: { id: string; user: { id: string; fullName: string; email: string; isActive: boolean } };
  };
  reviewedBy: { id: string; fullName: string } | null;
}
