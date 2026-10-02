/**
 * AI Cinema - Token budget of Reviewers: the Reviewer's own wallet, and the Admin's grants.
 */
import { API_ROUTES } from '@/constants/apiRoutes';
import type { ReviewerBudgetRow, ReviewerTokenEntryType, ReviewerWallet } from '@/types/reviewer-token';
import { apiClient } from './apiClient';

const T = API_ROUTES.REVIEWER_TOKENS;

/** Fired after anything changes a Reviewer's balance, so the sidebar figure follows. */
export const TOKENS_CHANGED_EVENT = 'reviewer-tokens:changed';

export function announceTokensChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(TOKENS_CHANGED_EVENT));
}

export const reviewerTokenService = {
  mine: () => apiClient.get<ReviewerWallet>(T.ME),
  listReviewers: () => apiClient.get<ReviewerBudgetRow[]>(T.ADMIN_LIST),
  walletOf: (reviewerId: string) => apiClient.get<ReviewerWallet>(T.ADMIN_WALLET(reviewerId)),
  addEntry: (reviewerId: string, entry: { entryType: ReviewerTokenEntryType; amountTokens: number; reason?: string }) =>
    apiClient.post<ReviewerWallet>(T.ADMIN_ENTRIES(reviewerId), entry),
};
