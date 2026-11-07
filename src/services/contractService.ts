/** Contract negotiation of a hand-off's production cost between Admin and the studio (Studio Web webhook). */
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Contract } from '@/types/contract';
import { apiClient } from './apiClient';

const R = API_ROUTES.PRODUCTION;

export const contractService = {
  forProject: (movieId: string) => apiClient.get<Contract[]>(R.CONTRACTS(movieId)),
  /** Admin: send the studio a template contract for this hand-off (no cost yet). */
  create: (movieId: string, handoffId: string, terms?: string) =>
    apiClient.post<Contract>(R.CONTRACT_CREATE(movieId, handoffId), terms ? { terms } : {}),
  /** Admin: agree with the studio's cost and sign, completing the contract. */
  sign: (id: string) => apiClient.post<Contract>(R.CONTRACT_SIGN(id), {}),
  /** Admin: propose a different cost instead, signed, opening a new round for the studio. */
  counter: (id: string, costVnd: number) => apiClient.post<Contract>(R.CONTRACT_COUNTER(id), { costVnd }),
};
