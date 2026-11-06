/** Production cost of a movie in VND (AI_Cinema_BE production-cost, cost-request). Amounts come as numbers. */
import type { Person } from './production-studio';

export type CostEntryType = 'BUDGET' | 'ADDITIONAL' | 'CORRECTION';
export type CostRequestStatus = 'OPEN' | 'APPROVED' | 'REJECTED';

/** Budget = sum of the entries; committed = fees studios hold; remaining = what a new fee may still use. */
export interface CostSummary {
  budgetVnd: number;
  committedVnd: number;
  remainingVnd: number;
}

export interface CostEntry {
  id: string;
  entryType: CostEntryType;
  amountVnd: number;
  reason: string | null;
  createdAt: string;
  createdBy: Person;
  request: { id: string; requestedVnd: number; studioQuoteVnd: number | null } | null;
}

export interface CostLedger extends CostSummary {
  entries: CostEntry[];
}

/** "Yêu cầu thêm chi phí sản xuất": the Reviewer asks, the Admin grants (possibly less) or refuses. */
export interface CostRequest {
  id: string;
  projectId: string;
  handoffId: string | null;
  requestedVnd: number;
  studioQuoteVnd: number | null;
  grantedVnd: number | null;
  reason: string;
  attachmentName: string | null;
  status: CostRequestStatus;
  adminResponse: string | null;
  resolvedAt: string | null;
  createdAt: string;
  project: { id: string; reviewerId: string; movie: { title: string } };
  handoff: { id: string; offeredFeeVnd: number; milestoneStatus: string; studio: { id: string; name: string } } | null;
  requestedBy: Person;
  resolvedBy: Person | null;
}

export interface CostRequestPage {
  data: CostRequest[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface CostRequestInput {
  requestedVnd: number;
  studioQuoteVnd?: number;
  handoffId?: string;
  reason: string;
  proof: File;
}
