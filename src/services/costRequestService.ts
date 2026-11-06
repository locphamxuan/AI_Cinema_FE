/** "Yêu cầu thêm chi phí sản xuất": the Reviewer asks the Admin, with the studio quote; the Admin decides. */
import { API_ROUTES } from '@/constants/apiRoutes';
import type { CostRequest, CostRequestInput, CostRequestPage, CostRequestStatus } from '@/types/cost';
import { apiClient } from './apiClient';

const R = API_ROUTES.PRODUCTION;

function query(page: number, limit: number, status?: CostRequestStatus): string {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return params.toString();
}

/** Multipart body: the amounts and reason as text, the quote as `proof`. */
export function costRequestForm(input: CostRequestInput): FormData {
  const form = new FormData();
  form.append('requestedVnd', String(input.requestedVnd));
  if (input.studioQuoteVnd) form.append('studioQuoteVnd', String(input.studioQuoteVnd));
  if (input.handoffId) form.append('handoffId', input.handoffId);
  form.append('reason', input.reason);
  form.append('proof', input.proof);
  return form;
}

export const costRequestService = {
  create: (movieId: string, input: CostRequestInput) =>
    apiClient.postForm<CostRequest>(R.COST_REQUESTS(movieId), costRequestForm(input)),
  forProject: (movieId: string, page = 1, limit = 10, status?: CostRequestStatus) =>
    apiClient.get<CostRequestPage>(`${R.COST_REQUESTS(movieId)}?${query(page, limit, status)}`),
  /** The Admin's inbox, or the requests of the Reviewer's own projects; open ones first. */
  list: (page = 1, limit = 20, status?: CostRequestStatus) =>
    apiClient.get<CostRequestPage>(`${R.COST_REQUEST_INBOX}?${query(page, limit, status)}`),
  downloadProof: (id: string) => apiClient.getBlob(R.COST_REQUEST_PROOF(id)),
  approve: (id: string, input: { grantedVnd?: number; response?: string }) =>
    apiClient.post<CostRequest>(R.COST_REQUEST_APPROVE(id), input),
  reject: (id: string, response: string) => apiClient.post<CostRequest>(R.COST_REQUEST_REJECT(id), { response }),
};
