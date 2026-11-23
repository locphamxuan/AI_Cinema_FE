/** MF-5 Financial Dashboard of the Admin: profit / ROI per film (BR-48 monthly-plan share included), risk flags. */
import { apiClient } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Page } from '@/types/production';
import type { FilmFinanceReport, RiskFlag, RiskFlagStatus, RiskRule } from '@/types/finance';

const F = API_ROUTES.FINANCE;

export function flagsQuery(page: number, limit: number, status?: RiskFlagStatus, ruleCode?: string): string {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy: 'createdAt:DESC' });
  if (status) params.set('filter.status', `$eq:${status}`);
  if (ruleCode) params.set('filter.ruleCode', `$eq:${ruleCode}`);
  return params.toString();
}

export const financeService = {
  films: () => apiClient.get<FilmFinanceReport>(F.FILMS),
  riskRules: () => apiClient.get<RiskRule[]>(F.RISK_RULES),
  riskFlags: (page: number, limit: number, status?: RiskFlagStatus, ruleCode?: string) =>
    apiClient.get<Page<RiskFlag>>(`${F.RISK_FLAGS}?${flagsQuery(page, limit, status, ruleCode)}`),
  scan: () => apiClient.post<{ created: number }>(F.RISK_SCAN, {}),
  review: (flagId: string, decision: 'CONFIRMED' | 'DISMISSED', note?: string) =>
    apiClient.post<RiskFlag>(F.RISK_REVIEW(flagId), { decision, ...(note?.trim() ? { note: note.trim() } : {}) }),
};

/** "10/2026" */
export function periodLabel(period: string): string {
  const [y, m] = period.split('-');
  return `${m}/${y}`;
}
