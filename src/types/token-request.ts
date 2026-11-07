import type { ProjectRef } from './production-studio';

/** A Creator asks the Reviewer for more production-fee Token for a season (AI_Cinema_BE token-request). */
export type TokenRequestStatus = 'OPEN' | 'APPROVED' | 'REJECTED';

export interface TokenRequest {
  id: string;
  projectId: string;
  seasonId: string;
  requestedTokens: number;
  grantedTokens: number | null;
  reason: string;
  status: TokenRequestStatus;
  reviewerResponse: string | null;
  resolvedAt: string | null;
  createdAt: string;
  project: ProjectRef;
  season: { id: string; seasonNumber: number; title: string | null };
  requestedBy: { id: string; fullName: string; email: string };
  resolvedBy: { id: string; fullName: string } | null;
}

export interface TokenRequestPage {
  data: TokenRequest[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}