import type { WorkflowState } from '@/types/workflow';

/** Every state after the plan was approved and granted a quota. */
const PLAN_APPROVED: WorkflowState[] = [
  'QUOTA_ALLOCATED',
  'IN_PRODUCTION',
  'CUT_CHANGES_REQUESTED',
  'EPISODE_SUBMITTED',
  'COMPLIANCE_PASSED',
  'PUBLISHED',
];

/** States in which the Creator still generates and hands in a cut. */
const PRODUCING: WorkflowState[] = ['QUOTA_ALLOCATED', 'IN_PRODUCTION', 'CUT_CHANGES_REQUESTED'];

/** The plan is approved with a quota: the episode is in, or past, production. */
export const isPlanApproved = (status: WorkflowState) => PLAN_APPROVED.includes(status);

/**
 * The Creator may generate and hand in a cut. A cut waiting for the Reviewer,
 * approved or published is left alone (the backend refuses to replace it).
 */
export const canProduce = (status: WorkflowState) => PRODUCING.includes(status);

/** The Reviewer decides on a cut only while it waits for a decision. */
export const isAwaitingAudit = (status: WorkflowState) => status === 'EPISODE_SUBMITTED';

/** A plan the Creator has not sent yet, or must rework: still editable. */
export const isDraft = (episode: { status: WorkflowState }) => episode.status === 'PLAN_DRAFT' || episode.status === 'CHANGES_REQUESTED';
