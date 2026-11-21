import { apiClient } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Page } from '@/types/production';
import type { Policy, PolicyType } from '@/types/policy';

export interface PolicyInput {
  name: string;
  type: PolicyType;
  version: string;
  documentReference?: string | null;
  content?: Record<string, unknown> | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  isActive?: boolean;
}

export interface PolicyFilters {
  search?: string;
  type?: PolicyType;
  /** true = only policies in force, false = only inactive ones. */
  active?: boolean;
}

export function policiesQuery(page: number, limit: number, f: PolicyFilters = {}): string {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy: 'name:ASC' });
  if (f.search?.trim()) params.set('search', f.search.trim());
  if (f.type) params.set('filter.type', `$eq:${f.type}`);
  if (f.active !== undefined) params.set('filter.isActive', `$eq:${f.active}`);
  return params.toString();
}

export const policyService = {
  list: (page: number, limit: number, filters?: PolicyFilters) =>
    apiClient.get<Page<Policy>>(`${API_ROUTES.POLICIES}?${policiesQuery(page, limit, filters)}`),

  create: (input: PolicyInput) => apiClient.post<Policy>(API_ROUTES.POLICIES, input),

  update: (id: string, input: Partial<PolicyInput>) =>
    apiClient.patch<Policy>(`${API_ROUTES.POLICIES}/${id}`, input),

  remove: (id: string) => apiClient.delete<unknown>(`${API_ROUTES.POLICIES}/${id}`),
};
