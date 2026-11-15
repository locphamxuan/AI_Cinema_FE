/** MF-5 Financial Dashboard of the Admin: profit / ROI per film, BR-48 monthly-plan revenue share, risk flags. */
import { apiClient } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Page } from '@/types/production';
import type { FilmFinanceReport, RevenueAllocation, RiskFlag, RiskFlagStatus, RiskRule } from '@/types/finance';

const F = API_ROUTES.FINANCE;

export function flagsQuery(page: number, limit: number, status?: RiskFlagStatus, ruleCode?: string): string {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy: 'createdAt:DESC' });
  if (status) params.set('filter.status', `$eq:${status}`);
  if (ruleCode) params.set('filter.ruleCode', `$eq:${ruleCode}`);
  return params.toString();
}

export const financeService = {
  films: () => apiClient.get<FilmFinanceReport>(F.FILMS),
  /** Without `period` the backend answers last month. */
  allocation: (period?: string) => apiClient.get<RevenueAllocation>(`${F.ALLOCATIONS}${period ? `?period=${period}` : ''}`),
  runAllocation: (period: string) => apiClient.post<RevenueAllocation>(F.ALLOCATION_RUN(period), {}),
  riskRules: () => apiClient.get<RiskRule[]>(F.RISK_RULES),
  riskFlags: (page: number, limit: number, status?: RiskFlagStatus, ruleCode?: string) =>
    apiClient.get<Page<RiskFlag>>(`${F.RISK_FLAGS}?${flagsQuery(page, limit, status, ruleCode)}`),
  scan: () => apiClient.post<{ created: number }>(F.RISK_SCAN, {}),
  review: (flagId: string, decision: 'CONFIRMED' | 'DISMISSED', note?: string) =>
    apiClient.post<RiskFlag>(F.RISK_REVIEW(flagId), { decision, ...(note?.trim() ? { note: note.trim() } : {}) }),
};

/** "2026-10" for the month before `now`, in Vietnam time (the backend's business month). */
export function previousPeriod(now = new Date()): string {
  const vn = new Date(now.getTime() + 7 * 3600_000);
  const d = new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth() - 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Only a month that is over may be allocated (BE 409 otherwise). */
export function isPeriodOver(period: string, now = new Date()): boolean {
  return period <= previousPeriod(now);
}

/** "10/2026" */
export function periodLabel(period: string): string {
  const [y, m] = period.split('-');
  return `${m}/${y}`;
}
