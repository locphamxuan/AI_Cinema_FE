/** Contract negotiation of a project's production cost with its studio (AI_Cinema_BE contract). Amounts come as numbers. */
import type { Person } from './production-studio';

export type ContractProposedBy = 'ADMIN' | 'STUDIO';
export type ContractStatus = 'SENT' | 'STUDIO_SIGNED' | 'ADMIN_COUNTERED' | 'SIGNED' | 'SUPERSEDED';

/**
 * One round of the negotiation: the system sends the studio a template with no cost when the Admin approves the
 * Final Script (round 1); the studio fills it in and signs; the Admin signs to agree or counter-proposes a new
 * cost, opening the next round, until one round carries both signatures (SIGNED) - which hands the project off.
 */
export interface Contract {
  id: string;
  projectId: string;
  studioId: string;
  /** The hand-off the signature opened; null until the contract is signed. */
  handoffId: string | null;
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
  studio: { id: string; name: string };
  handoff: { id: string; milestoneStatus: string } | null;
  createdBy: Person;
  adminSignedBy: Person | null;
}
