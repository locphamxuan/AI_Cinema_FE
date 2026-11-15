/** MF-5 Financial Dashboard (BE src/modules/platform/finance). Every amount is whole VND. */

export interface FilmFinance {
  movieId: string;
  title: string;
  projectStatus: string;
  productionCostVnd: number;
  /** Unlock revenue, Coin refunded already taken off. */
  unlockRevenueVnd: number;
  refundedVnd: number;
  planShareVnd: number;
  revenueVnd: number;
  profitVnd: number;
  /** null while the film has no production cost. */
  roiPercent: number | null;
  breakEven: boolean;
}

export interface FilmFinanceReport {
  totals: { productionCostVnd: number; revenueVnd: number; profitVnd: number; roiPercent: number | null; breakEvenMovies: number };
  films: FilmFinance[];
}

export interface RevenueAllocation {
  period: string;
  monthlyPoolVnd: number;
  totalWatchSeconds: number;
  allocatedAt: string | null;
  movies: { movieId: string; title: string; watchSeconds: number; sharePercent: number; allocatedVnd: number }[];
}

export interface RiskRule {
  code: string;
  description: string;
}

export type RiskFlagStatus = 'OPEN' | 'CONFIRMED' | 'DISMISSED';

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
    wallet: { id: string; user: { id: string; fullName: string; email: string } };
  };
  reviewedBy: { id: string; fullName: string } | null;
}
