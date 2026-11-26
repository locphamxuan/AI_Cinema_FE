/** BE `PolicyDto` (GET /policies): the rules a Reviewer follows when labelling and checking an episode. */
export type PolicyType = 'AI_LABELING' | 'CONTENT_POLICY' | 'LEGAL';

export interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  version: string;
  documentReference: string | null;
  /** Plain text; line breaks and "- " bullets are kept as written. */
  content: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
