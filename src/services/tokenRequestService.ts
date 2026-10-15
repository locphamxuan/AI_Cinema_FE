/** Creator → Reviewer requests for more production-fee Token; the Admin follows every one. */
import { API_ROUTES } from '@/constants/apiRoutes';
import type { TokenRequest, TokenRequestPage, TokenRequestStatus } from '@/types/token-request';
import { apiClient } from './apiClient';

const R = API_ROUTES.PRODUCTION;

function query(page: number, limit: number, status?: TokenRequestStatus): string {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return params.toString();
}

export const tokenRequestService = {
  create: (movieId: string, input: { seasonId: string; requestedTokens: number; reason: string }) =>
    apiClient.post<TokenRequest>(R.TOKEN_REQUESTS(movieId), input),
  forProject: (movieId: string, page = 1, limit = 10, status?: TokenRequestStatus) =>
    apiClient.get<TokenRequestPage>(`${R.TOKEN_REQUESTS(movieId)}?${query(page, limit, status)}`),
  /** Reviewer: requests on their projects · Creator: their own · Admin: every request. */
  list: (page = 1, limit = 10, status?: TokenRequestStatus) =>
    apiClient.get<TokenRequestPage>(`${R.TOKEN_REQUEST_INBOX}?${query(page, limit, status)}`),
  approve: (id: string, grantedTokens?: number) =>
    apiClient.post<TokenRequest>(R.TOKEN_REQUEST_APPROVE(id), grantedTokens ? { grantedTokens } : {}),
  reject: (id: string, response: string) => apiClient.post<TokenRequest>(R.TOKEN_REQUEST_REJECT(id), { response }),
};