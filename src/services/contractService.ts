/** Contract negotiation of a project's production cost: the Admin here, the studio on Studio Web (/studio-portal). */
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Contract } from '@/types/contract';
import { apiClient } from './apiClient';

const R = API_ROUTES.PRODUCTION;

export const contractService = {
  forProject: (movieId: string) => apiClient.get<Contract[]>(R.CONTRACTS(movieId)),
  /** Admin: send the project's studio its template contract again (normally sent on the Final Script). */
  create: (movieId: string, terms?: string) => apiClient.post<Contract>(R.CONTRACTS(movieId), terms?.trim() ? { terms: terms.trim() } : {}),
  /** Admin: agree with the studio's cost and sign, completing the contract. */
  sign: (id: string) => apiClient.post<Contract>(R.CONTRACT_SIGN(id), {}),
  /** Admin: propose a different cost instead, signed, opening a new round for the studio. */
  counter: (id: string, costVnd: number) => apiClient.post<Contract>(R.CONTRACT_COUNTER(id), { costVnd }),
};
