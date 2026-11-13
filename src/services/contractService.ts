/** Contract negotiation of a project's production cost: the Admin here, the studio on Studio Web (/studio-portal). */
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Contract, ContractDocument, ContractDocumentSide } from '@/types/contract';
import { apiClient } from './apiClient';

const R = API_ROUTES.PRODUCTION;

export const contractService = {
  forProject: (movieId: string) => apiClient.get<Contract[]>(R.CONTRACTS(movieId)),
  /** Admin: send the project's studio its template contract again (normally sent on the Final Script). */
  create: (movieId: string, terms?: string) => apiClient.post<Contract>(R.CONTRACTS(movieId), terms?.trim() ? { terms: terms.trim() } : {}),
  /** Admin: agree with the studio's cost and sign with signed PDF file. */
  sign: (id: string, file?: File) => {
    if (file) {
      const form = new FormData();
      form.append('file', file);
      return apiClient.postForm<Contract>(R.CONTRACT_SIGN(id), form);
    }
    return apiClient.post<Contract>(R.CONTRACT_SIGN(id), {});
  },
  /** Admin: propose a different cost instead with signed PDF file. */
  counter: (id: string, costVnd: number, file?: File) => {
    if (file) {
      const form = new FormData();
      form.append('costVnd', String(costVnd));
      form.append('file', file);
      return apiClient.postForm<Contract>(R.CONTRACT_COUNTER(id), form);
    }
    return apiClient.post<Contract>(R.CONTRACT_COUNTER(id), { costVnd });
  },
  /** List signed PDF documents of a round (ADMIN, STUDIO, FINAL). */
  documents: (id: string) => apiClient.get<ContractDocument[]>(R.CONTRACT_DOCUMENTS(id)),
  /** Download signed PDF document content. */
  downloadDocument: async (id: string, side: ContractDocumentSide, fileName?: string): Promise<boolean> => {
    const blob = await apiClient.getBlob(R.CONTRACT_DOCUMENT_CONTENT(id, side));
    if (!blob) return false;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `hop-dong-${side.toLowerCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  },
};
