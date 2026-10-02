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

export interface TokenHistoryEntry {
  id: string;
  kind: ReviewerTokenEntryType | 'ALLOCATION';
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
}

export interface ReviewerBudgetRow extends TokenTotals {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
}
