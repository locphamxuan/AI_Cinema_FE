/** Token budget of a Reviewer (AI_Cinema_BE reviewer-token module). */
import type { TokenEntryType } from './production-enums';

export type ReviewerTokenEntryType = 'GRANT' | 'REVOKE';

export interface TokenTotals {
  /** Granted by the Admin, minus what the Admin took back. */
  grantedTokens: number;
  /** Production fees the Reviewer allocated to projects. */
  allocatedTokens: number;
  balanceTokens: number;
}

/** Tab of the history: the Admin's grants, fees put into projects, or top-ups a Creator asked for. */
export type TokenHistoryCategory = 'ADMIN' | 'PROJECT' | 'CREATOR_REQUEST';

export interface TokenHistoryEntry {
  id: string;
  kind: ReviewerTokenEntryType | 'ALLOCATION';
  category: TokenHistoryCategory;
  season: { id: string; seasonNumber: number; title: string | null } | null;
  /** Seen from the Reviewer's wallet: + came in, − went out. */
  amountTokens: number;
  rateVnd: number;
  reason: string | null;
  createdAt: string;
  by: { id: string; fullName: string } | null;
  movie: { id: string; title: string } | null;
  feeEntryType: TokenEntryType | null;
}

export interface ReviewerWallet extends TokenTotals {
  reviewer: { id: string; fullName: string; email: string };
  tokenRateVnd: number;
  history: TokenHistoryEntry[];
  /** MF-2 on the Reviewer's movies: Coin viewers paid to unlock episodes, and refunds. */
  coinActivity: CoinActivity;
}

export interface CoinActivityEntry {
  id: string;
  kind: 'EPISODE_PURCHASE' | 'REFUND';
  coins: number;
  vnd: number;
  at: string;
  note: string | null;
  movie: { id: string; title: string };
  episodeNumber: number;
}

export interface CoinActivity {
  movies: { movie: { id: string; title: string }; purchases: number; coins: number; refundedCoins: number }[];
  entries: CoinActivityEntry[];
}

export interface ReviewerBudgetRow extends TokenTotals {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
}
