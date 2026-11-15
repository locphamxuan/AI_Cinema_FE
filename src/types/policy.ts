/** BE `PolicyDto` (GET /policies): the legal texts AI labels and compliance checks follow. */
export type PolicyType = 'AI_LABELING' | 'CONTENT_POLICY' | 'COPYRIGHT' | 'LEGAL' | 'PUBLISHING';

export interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  version: string;
  documentReference: string | null;
  content: Record<string, unknown> | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  isActive: boolean;
  createdAt: string;
}
