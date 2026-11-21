/** Contract negotiation of a project's production cost: the Admin here, the studio on Studio Web (/studio-portal). */
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Contract, ContractDocument, ContractDocumentSide } from '@/types/contract';
import { saveBlob } from '@/lib/format';
import { apiClient } from './apiClient';

const R = API_ROUTES.PRODUCTION;

/** The backend's limit for a signed contract (multer): one PDF of at most 10 MB. */
export const CONTRACT_PDF_MAX_BYTES = 10 * 1024 * 1024;

/** The highest cost a round may carry (BE: 100 billion VND). */
export const MAX_CONTRACT_VND = 100_000_000_000;

/** Why a picked file cannot be sent as a signed contract, or null when it can. */
export function contractPdfProblem(file: File | null): string | null {
  if (!file) return 'Chọn file PDF hợp đồng đã ký.';
  const isPdf = file.type === 'application/pdf' || (!file.type && file.name.toLowerCase().endsWith('.pdf'));
  if (!isPdf) return 'File phải là PDF.';
  if (file.size > CONTRACT_PDF_MAX_BYTES) return 'File PDF tối đa 10 MB.';
  return null;
}

export const contractService = {
  forProject: (movieId: string) => apiClient.get<Contract[]>(R.CONTRACTS(movieId)),
  /** Admin: send the project's studio its template contract again (normally sent on the Final Script). */
  create: (movieId: string, terms?: string) => apiClient.post<Contract>(R.CONTRACTS(movieId), terms?.trim() ? { terms: terms.trim() } : {}),
  /** Admin: agree with the studio's cost; the signed PDF is required (BE 400 without `file`). */
  sign: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.postForm<Contract>(R.CONTRACT_SIGN(id), form);
  },
  /** Admin: propose a different cost, with the PDF signed for that cost. */
  counter: (id: string, costVnd: number, file: File) => {
    const form = new FormData();
    form.append('costVnd', String(costVnd));
    form.append('file', file);
    return apiClient.postForm<Contract>(R.CONTRACT_COUNTER(id), form);
  },
  /** List signed PDF documents of a round (ADMIN, STUDIO, FINAL). */
  documents: (id: string) => apiClient.get<ContractDocument[]>(R.CONTRACT_DOCUMENTS(id)),
  /** Download signed PDF document content. */
  downloadDocument: (id: string, side: ContractDocumentSide, fileName?: string): Promise<boolean> =>
    saveFrom(R.CONTRACT_DOCUMENT_CONTENT(id, side), fileName || `hop-dong-${side.toLowerCase()}.pdf`),
  /** Download the unsigned contract of a round, as the studio receives it. */
  downloadTemplate: (id: string): Promise<boolean> => saveFrom(R.CONTRACT_TEMPLATE(id), `hop-dong-chua-ky-${id.slice(0, 8)}.pdf`),
};

/** Fetches a PDF behind auth and saves it under `fileName`; false when it cannot be read. */
async function saveFrom(path: string, fileName: string): Promise<boolean> {
  const blob = await apiClient.getBlob(path);
  if (!blob) return false;
  saveBlob(blob, fileName);
  return true;
}
