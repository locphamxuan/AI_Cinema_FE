/** Contract negotiation of a hand-off's production cost (AI_Cinema_BE contract). Amounts come as numbers. */
import type { Person } from './production-studio';

export type ContractProposedBy = 'ADMIN' | 'STUDIO';
export type ContractStatus = 'SENT' | 'STUDIO_SIGNED' | 'ADMIN_COUNTERED' | 'SIGNED' | 'SUPERSEDED';

/**
 * One round of a hand-off's negotiation: the system sends a template with no cost (round 1); the studio fills
 * it in and signs; Admin signs to agree or counter-proposes a new cost, opening the next round, until one
 * round carries both signatures (SIGNED). Production starts only once a hand-off has one.
 */
export interface Contract {
  id: string;
  projectId: string;
  handoffId: string;
  round: number;
  previousId: string | null;
  costVnd: number | null;
  proposedBy: ContractProposedBy | null;
  status: ContractStatus;
  terms: string;
  adminSignedAt: string | null;
  studioSignedAt: string | null;
  createdAt: string;
  project: { id: string; reviewerId: string; creatorId: string | null; movie: { title: string } };
  handoff: { id: string; milestoneStatus: string; studio: { id: string; name: string } };
  createdBy: Person;
  adminSignedBy: Person | null;
}
