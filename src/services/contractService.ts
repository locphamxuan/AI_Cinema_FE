/** Contract negotiation of a project's production cost: the Admin here, the studio on Studio Web (/studio-portal). */
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Contract, ContractDocument, ContractDocumentSide } from '@/types/contract';
import { saveBlob } from '@/lib/format';
import { apiClient } from './apiClient';

const R = API_ROUTES.PRODUCTION;

/** The backend's limits for a signature image (signature-image.ts): PNG/JPEG, at most 2 MB, legible size. */
export const SIGNATURE_MAX_BYTES = 2 * 1024 * 1024;
export const SIGNATURE_MIN_SIZE = { width: 150, height: 50 };
export const SIGNATURE_MAX_SIDE = 4000;

/** The highest cost a round may carry (BE: 100 billion VND). */
export const MAX_CONTRACT_VND = 100_000_000_000;

/** Why a picked file cannot be sent as a signature image, or null when it can. */
export function signatureImageProblem(file: File | null): string | null {
  if (!file) return 'Chọn ảnh chữ ký.';
  const isImage = ['image/png', 'image/jpeg'].includes(file.type) || /\.(png|jpe?g)$/i.test(file.name);
  if (!isImage) return 'Ảnh chữ ký phải là file PNG hoặc JPG.';
  if (file.size > SIGNATURE_MAX_BYTES) return 'Ảnh chữ ký tối đa 2 MB.';
  return null;
}

/** Why an image of this pixel size would not print legibly in the signature block, or null. */
export function signatureSizeProblem(width: number, height: number): string | null {
  if (width < SIGNATURE_MIN_SIZE.width || height < SIGNATURE_MIN_SIZE.height) {
    return `Ảnh quá nhỏ (${width}x${height} px), cần ít nhất ${SIGNATURE_MIN_SIZE.width}x${SIGNATURE_MIN_SIZE.height} px.`;
  }
  if (width > SIGNATURE_MAX_SIDE || height > SIGNATURE_MAX_SIDE) {
    return `Ảnh quá lớn (${width}x${height} px), mỗi cạnh tối đa ${SIGNATURE_MAX_SIDE} px; hãy cắt sát chữ ký.`;
  }
  return null;
}

export const contractService = {
  forProject: (movieId: string) => apiClient.get<Contract[]>(R.CONTRACTS(movieId)),
  /** Admin: send the project's studio its template contract again (normally sent on the Final Script). */
  create: (movieId: string, terms?: string) => apiClient.post<Contract>(R.CONTRACTS(movieId), terms?.trim() ? { terms: terms.trim() } : {}),
  /** Admin: agree with the studio's cost by signing with AI Cinema's signature image (BE 400 without `file`). */
  sign: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.postForm<Contract>(R.CONTRACT_SIGN(id), form);
  },
  /** Admin: propose a different cost and sign the contract for it with the signature image. */
  counter: (id: string, costVnd: number, file: File) => {
    const form = new FormData();
    form.append('costVnd', String(costVnd));
    form.append('file', file);
    return apiClient.postForm<Contract>(R.CONTRACT_COUNTER(id), form);
  },
  /** The signed copies of a round the system rendered (ADMIN, STUDIO, FINAL). */
  documents: (id: string) => apiClient.get<ContractDocument[]>(R.CONTRACT_DOCUMENTS(id)),
  /** Download a signed copy. */
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
