/**
 * MF-1 B2B Contract Negotiation Types (Admin <-> Studio Partner)
 */
import type { Studio } from './production';

export type ContractProposedBy = 'ADMIN' | 'STUDIO';

export type ContractStatus =
  | 'SENT'
  | 'STUDIO_SIGNED'
  | 'ADMIN_COUNTERED'
  | 'SIGNED'
  | 'SUPERSEDED';

export interface Contract {
  id: string;
  projectId: string;
  studioId: string;
  handoffId?: string | null;
  round: number;
  previousId?: string | null;
  costVnd?: number | null;
  proposedBy?: ContractProposedBy | null;
  status: ContractStatus;
  terms: string;
  adminSignedAt?: string | null;
  adminSignedById?: string | null;
  studioSignedAt?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  studio?: Studio;
  previous?: Contract | null;
  next?: Contract | null;
}

export interface CreateContractInput {
  terms?: string;
}

export interface ContractCostInput {
  costVnd: number;
}
